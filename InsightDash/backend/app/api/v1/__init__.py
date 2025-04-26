from fastapi import APIRouter
from .auth import router as auth_router
from .datasets import router as datasets_router
from .analytics import router as analytics_router
from .websocket import router as websocket_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(datasets_router, prefix="/datasets", tags=["datasets"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
api_router.include_router(websocket_router, prefix="/ws", tags=["websocket"])
