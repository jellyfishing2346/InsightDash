from pydantic_settings import BaseSettings
from typing import List, Optional
from pydantic import field_validator


class Settings(BaseSettings):
    # Database - Using SQLite for development
    database_url: str = "sqlite:///./insightdash.db"
    
    # Optional PostgreSQL settings (ignored when using SQLite)
    postgres_user: Optional[str] = None
    postgres_password: Optional[str] = None
    postgres_db: Optional[str] = None
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # Security
    secret_key: str = "your-secret-key-change-this-in-production-12345678"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    allowed_origins: str = "http://localhost:3000,https://insightdash.vercel.app"
    
    # App
    debug: bool = True
    environment: str = "development"
    app_name: str = "InsightDash API"
    version: str = "1.0.0"
    
    # Optional external services
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    
    @field_validator('allowed_origins')
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    @property
    def origins_list(self) -> List[str]:
        if isinstance(self.allowed_origins, str):
            return [origin.strip() for origin in self.allowed_origins.split(',')]
        return self.allowed_origins
    
    class Config:
        env_file = ".env"


settings = Settings()
