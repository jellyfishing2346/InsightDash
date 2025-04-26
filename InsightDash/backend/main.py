from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import api_router
from app.core.database import engine
from app.models import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="A dynamic dashboard for visualizing complex datasets with real-time updates and predictive insights",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "Welcome to InsightDash API",
        "version": settings.version,
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.environment,
        "version": settings.version
    }
