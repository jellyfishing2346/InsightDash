from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="viewer")  # admin, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    datasets = relationship("Dataset", back_populates="owner")


class Dataset(Base):
    __tablename__ = "datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    data_type = Column(String, default="time_series")  # time_series, categorical, etc.
    owner_id = Column(Integer, ForeignKey("users.id"))
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="datasets")
    data_points = relationship("DataPoint", back_populates="dataset")
    dashboards = relationship("Dashboard", back_populates="dataset")


class DataPoint(Base):
    __tablename__ = "data_points"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    value = Column(Float, nullable=False)  # Numeric value
    meta_data = Column(JSON)  # Additional data as JSON (renamed from metadata)
    
    # Relationships
    dataset = relationship("Dataset", back_populates="data_points")


class Dashboard(Base):
    __tablename__ = "dashboards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    config = Column(JSON)  # Dashboard layout and widget configuration
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    dataset = relationship("Dataset", back_populates="dashboards")
    owner = relationship("User")


class Forecast(Base):
    __tablename__ = "forecasts"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    model_type = Column(String)  # arima, linear_regression, etc.
    target_column = Column(String)
    forecast_data = Column(JSON)  # Predicted values
    confidence_interval = Column(JSON)  # Upper and lower bounds
    accuracy_metrics = Column(JSON)  # RMSE, MAE, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    dataset = relationship("Dataset")
