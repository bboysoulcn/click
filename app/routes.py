from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert
from app.database import get_db
from app.models import Counter
from app.schemas import (
    GetHitsRequest, GetHitsResponse,
    IncrementHitsRequest, IncrementHitsResponse,
    StatusResponse
)
from app.rate_limit import rate_limiter
from typing import Dict
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["iine"])


def get_origin_from_request(request: Request) -> str:
    """从请求头中提取并规范化来源域名"""
    origin = request.headers.get("origin")
    if not origin:
        # 回退到 referer
        referer = request.headers.get("referer")
        if referer:
            origin = referer

    if not origin:
        raise HTTPException(status_code=400, detail="缺少 origin 或 referer 请求头")

    return Counter.canonicalize_domain(origin)


@router.post("/get_hits", response_model=Dict[str, int])
async def get_hits(
    request: Request,
    payload: GetHitsRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    批量获取多个页面的点击数
    """
    try:
        # 获取来源域名
        canonical_domain = get_origin_from_request(request)

        if not canonical_domain:
            return {}

        # 限制 slug 数量
        if len(payload.page_slugs) > 20:
            raise HTTPException(
                status_code=400,
                detail="批量查询数量超过限制（最多 20 个）"
            )

        # 规范化 slugs
        canonical_slugs = [Counter.canonicalize_slug(slug) for slug in payload.page_slugs]

        # 查询数据库
        result = await db.execute(
            select(Counter.slug, Counter.counter)
            .where(
                Counter.origin_domain == canonical_domain,
                Counter.slug.in_(canonical_slugs)
            )
        )

        rows = result.all()
        counts_map = {row[0]: row[1] for row in rows}

        # 返回所有请求的 slug 的计数（缺失的返回 0）
        response = {}
        for slug in payload.page_slugs:
            canonical = Counter.canonicalize_slug(slug)
            response[slug] = counts_map.get(canonical, 0)

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"get_hits 错误: {e}")
        raise HTTPException(status_code=500, detail="内部服务器错误")


@router.post("/increment_hits", response_model=IncrementHitsResponse)
async def increment_hits(
    request: Request,
    payload: IncrementHitsRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    增加页面点击数
    """
    try:
        # 检查速率限制
        is_rate_limited = await rate_limiter.check_rate_limit(request, db)
        if is_rate_limited:
            raise HTTPException(
                status_code=429,
                detail="请求过于频繁，请稍后再试"
            )

        # 验证请求
        user_agent = request.headers.get("user-agent")
        if not user_agent:
            raise HTTPException(status_code=400, detail="无效请求")

        # 获取来源域名
        canonical_domain = get_origin_from_request(request)
        canonical_slug = Counter.canonicalize_slug(payload.page_slug)

        if not canonical_domain:
            raise HTTPException(status_code=400, detail="无效域名")

        # 使用 PostgreSQL 的 ON CONFLICT 插入或更新计数器
        stmt = insert(Counter).values(
            origin_domain=canonical_domain,
            slug=canonical_slug,
            counter=1
        ).on_conflict_do_update(
            index_elements=['origin_domain', 'slug'],
            set_={'counter': Counter.counter + 1}
        ).returning(Counter.counter)

        result = await db.execute(stmt)
        await db.commit()

        new_count = result.scalar_one()

        return IncrementHitsResponse(
            message=f"{canonical_domain}{canonical_slug} liked! ♥️",
            new_count=new_count
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"increment_hits 错误: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="内部服务器错误")


-e 
@router.get("/status", response_model=StatusResponse)
async def status():
    return StatusResponse()
