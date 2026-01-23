from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routes import router
import logging
import os

from app.schemas import (
    StatusResponse
)

# 配置日志
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动事件
    logger.info("正在启动 Click API 服务器...")
    logger.info("速率限制已启用（内存 + 数据库）")
    yield
    # 关闭事件
    logger.info("正在关闭 Click API 服务器...")

# 创建 FastAPI 应用
app = FastAPI(
    title="Click - 点赞按钮 API",
    description="注重隐私的页面点击计数和点赞按钮系统",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# 包含路由
app.include_router(router)

# 挂载静态文件
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    logger.info(f"静态文件已从 {static_dir} 挂载")



@app.get("/", response_model=StatusResponse)
async def status():
    """
    健康检查接口
    """
    return StatusResponse(status="live", version="1.0.0")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
