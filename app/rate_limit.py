from fastapi import Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.config import settings
from app.models import RateLimit
from datetime import datetime, timedelta
import hashlib
import logging
from typing import Dict

logger = logging.getLogger(__name__)


class RateLimiter:
    """内存 + 数据库的速率限制器"""
    
    def __init__(self):
        self.max_requests = settings.rate_limit_requests
        self.window_seconds = settings.rate_limit_window
        # 内存缓存，格式: {identifier_hash: (count, last_check_time)}
        self._cache: Dict[int, tuple[int, datetime]] = {}
        self._last_cleanup = datetime.utcnow()
    
    def _get_client_identifier(self, request: Request) -> str:
        """从请求中获取客户端标识符"""
        # 尝试从 Cloudflare 头部获取真实 IP
        client_ip = request.headers.get("cf-connecting-ip")
        
        # 回退到 X-Forwarded-For
        if not client_ip:
            forwarded = request.headers.get("x-forwarded-for")
            if forwarded:
                client_ip = forwarded.split(",")[0].strip()
        
        # 回退到直接客户端 IP
        if not client_ip and request.client:
            client_ip = request.client.host
        
        return client_ip or "unknown"
    
    def _get_identifier_hash(self, identifier: str) -> int:
        """生成客户端标识符的哈希值（带时间窗口）"""
        current_hour = datetime.utcnow().strftime("%Y-%m-%d-%H")
        key_string = f"{identifier}:{current_hour}"
        # 使用 hashlib 生成哈希，然后转换为整数
        hash_bytes = hashlib.sha256(key_string.encode()).digest()
        # 取前 8 字节转换为 64 位整数
        return int.from_bytes(hash_bytes[:8], byteorder='big', signed=True)
    
    def _cleanup_memory_cache(self):
        """清理过期的内存缓存"""
        now = datetime.utcnow()
        # 每小时清理一次
        if (now - self._last_cleanup).total_seconds() < 3600:
            return
        
        cutoff_time = now - timedelta(seconds=self.window_seconds)
        self._cache = {
            k: v for k, v in self._cache.items()
            if v[1] > cutoff_time
        }
        self._last_cleanup = now
        logger.info(f"Memory cache cleaned. Remaining entries: {len(self._cache)}")
    
    async def check_rate_limit(self, request: Request, db: AsyncSession) -> bool:
        """
        检查是否超过速率限制
        返回 True 表示超限，False 表示正常
        """
        try:
            # 清理过期缓存
            self._cleanup_memory_cache()
            
            identifier = self._get_client_identifier(request)
            identifier_hash = self._get_identifier_hash(identifier)
            
            # 先检查内存缓存
            now = datetime.utcnow()
            if identifier_hash in self._cache:
                count, last_time = self._cache[identifier_hash]
                # 检查缓存是否在时间窗口内
                if (now - last_time).total_seconds() < self.window_seconds:
                    if count >= self.max_requests:
                        logger.warning(f"Rate limit exceeded for {identifier} (memory cache)")
                        return True
                    # 更新内存缓存
                    self._cache[identifier_hash] = (count + 1, now)
                    return False
            
            # 内存中没有或已过期，查询数据库
            result = await db.execute(
                select(RateLimit).where(RateLimit.identifier_hash == identifier_hash)
            )
            rate_limit = result.scalar_one_or_none()
            
            if rate_limit:
                # 检查是否在时间窗口内
                time_diff = (now - rate_limit.created_at.replace(tzinfo=None)).total_seconds()
                
                if time_diff < self.window_seconds:
                    if rate_limit.request_count >= self.max_requests:
                        logger.warning(f"Rate limit exceeded for {identifier}")
                        # 更新内存缓存
                        self._cache[identifier_hash] = (rate_limit.request_count, now)
                        return True
                    
                    # 增加计数
                    rate_limit.request_count += 1
                    await db.commit()
                    # 更新内存缓存
                    self._cache[identifier_hash] = (rate_limit.request_count, now)
                    return False
                else:
                    # 时间窗口已过，删除旧记录，创建新记录
                    await db.delete(rate_limit)
                    await db.flush()
            
            # 创建新的速率限制记录
            new_rate_limit = RateLimit(
                identifier_hash=identifier_hash,
                request_count=1
            )
            db.add(new_rate_limit)
            await db.commit()
            
            # 更新内存缓存
            self._cache[identifier_hash] = (1, now)
            return False
            
        except Exception as e:
            logger.error(f"Rate limit check error: {e}")
            # 出错时允许请求（fail open）
            return False
    
    async def cleanup_old_records(self, db: AsyncSession):
        """清理过期的数据库记录（定期执行）"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(seconds=self.window_seconds)
            result = await db.execute(
                delete(RateLimit).where(RateLimit.created_at < cutoff_time)
            )
            await db.commit()
            deleted_count = result.rowcount
            if deleted_count > 0:
                logger.info(f"Cleaned up {deleted_count} old rate limit records")
        except Exception as e:
            logger.error(f"Error cleaning up old records: {e}")
            await db.rollback()


# 全局速率限制器实例
rate_limiter = RateLimiter()
