from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: str = "viewer"


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Dataset Schemas
class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None
    data_type: str = "time_series"
    is_public: bool = False


class DatasetCreate(DatasetBase):
    pass


class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    data_type: Optional[str] = None
    is_public: Optional[bool] = None


class Dataset(DatasetBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# DataPoint Schemas
class DataPointBase(BaseModel):
    timestamp: Optional[datetime] = None
    value: float
    meta_data: Optional[Dict[str, Any]] = None


class DataPointCreate(BaseModel):
    timestamp: Optional[str] = None  # Accept string for easier API usage
    value: float
    meta_data: Optional[Dict[str, Any]] = None


class DataPoint(BaseModel):
    id: int
    dataset_id: int
    timestamp: datetime
    value: float
    meta_data: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True


# Dashboard Schemas
class DashboardBase(BaseModel):
    name: str
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_public: bool = False


class DashboardCreate(DashboardBase):
    dataset_id: int


class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None


class Dashboard(DashboardBase):
    id: int
    dataset_id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Forecast Schemas
class ForecastRequest(BaseModel):
    dataset_id: int
    periods: int = 30
    model_type: str = "arima"


class ForecastBase(BaseModel):
    dataset_id: int
    model_type: str
    target_column: str = "value"
    forecast_data: Optional[Any] = None  # Can be list or dict depending on the forecast service
    confidence_interval: Optional[Dict[str, Any]] = None
    accuracy_metrics: Optional[Dict[str, Any]] = None


class ForecastCreate(ForecastBase):
    pass


class Forecast(ForecastBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# WebSocket Schemas
class WebSocketMessage(BaseModel):
    type: str  # data_update, forecast_complete, etc.
    payload: Dict[str, Any]
    timestamp: datetime = datetime.now()
