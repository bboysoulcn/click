import asyncio
import sys
from sqlalchemy import text
from app.database import async_session_maker, engine
from app.config import settings


async def check_database():
    """检查数据库连接是否正常"""
    try:
        async with async_session_maker() as session:
            result = await session.execute(text("SELECT 1"))
            print("✅ 数据库连接成功")
            return True
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        return False


async def check_tables():
    """检查所需的数据表是否存在"""
    try:
        async with async_session_maker() as session:
            result = await session.execute(
                text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            )
            tables = [row[0] for row in result]
            
            required_tables = ['counters', 'rate_limits']
            missing_tables = [t for t in required_tables if t not in tables]
            
            if missing_tables:
                print(f"⚠️  缺少数据表: {', '.join(missing_tables)}")
                print("运行 'alembic upgrade head' 创建数据表")
                return False
            else:
                print("✅ 所有必需的数据表都存在")
                return True
    except Exception as e:
        print(f"❌ 检查数据表时出错: {e}")
        return False


async def main():
    """运行所有健康检查"""
    print("=" * 50)
    print("Click 健康检查")
    print("=" * 50)
    print()
    
    print("配置信息:")
    print(f"  数据库: {settings.database_url.split('@')[1] if '@' in settings.database_url else '已配置'}")
    print(f"  主机: {settings.host}:{settings.port}")
    print(f"  调试模式: {settings.debug}")
    print(f"  速率限制: {settings.rate_limit_requests} 请求/{settings.rate_limit_window} 秒")
    print()
    
    checks = []
    
    print("运行检查...")
    print()
    
    checks.append(await check_database())
    checks.append(await check_tables())
    
    print()
    print("=" * 50)
    
    if all(checks):
        print("✅ 所有检查通过！")
        return 0
    else:
        print("⚠️  部分检查失败")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
