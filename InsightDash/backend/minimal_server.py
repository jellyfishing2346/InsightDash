"""
Minimal InsightDash Backend - Mock Implementation
This version provides API endpoints with mock data for demonstration purposes.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
import json
import random
from datetime import datetime, timedelta
import uuid

app = FastAPI(
    title="InsightDash API",
    description="Analytics and Forecasting Platform",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3005", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data storage
datasets_db = [
    {
        "id": str(uuid.uuid4()),
        "name": "Sales Data",
        "description": "Monthly sales figures",
        "row_count": 1000,
        "column_count": 5,
        "file_size": 45000,
        "file_type": "CSV",
        "status": "active",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-20T15:45:00Z",
        "columns": [
            {"name": "date", "type": "date"},
            {"name": "sales", "type": "number"},
            {"name": "region", "type": "string"},
            {"name": "product", "type": "string"},
            {"name": "revenue", "type": "number"}
        ]
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Customer Analytics",
        "description": "Customer behavior analysis",
        "row_count": 5000,
        "column_count": 8,
        "file_size": 120000,
        "file_type": "CSV",
        "status": "active",
        "created_at": "2024-01-10T08:15:00Z",
        "updated_at": "2024-01-22T12:30:00Z",
        "columns": [
            {"name": "customer_id", "type": "string"},
            {"name": "age", "type": "number"},
            {"name": "purchase_amount", "type": "number"},
            {"name": "category", "type": "string"},
            {"name": "timestamp", "type": "datetime"}
        ]
    }
]

forecasts_db = []

# Helper functions
def generate_mock_analytics_data():
    return {
        "summary": {
            "sales": {
                "mean": 15250.75,
                "std": 3420.12,
                "min": 8500.00,
                "max": 25600.00,
                "null_count": 0
            },
            "revenue": {
                "mean": 45800.50,
                "std": 12500.25,
                "min": 18000.00,
                "max": 89000.00,
                "null_count": 2
            }
        },
        "correlations": {
            "sales": {"sales": 1.0, "revenue": 0.85},
            "revenue": {"sales": 0.85, "revenue": 1.0}
        },
        "time_series": [
            {
                "date": (datetime.now() - timedelta(days=30-i)).isoformat(),
                "sales": random.uniform(10000, 20000),
                "revenue": random.uniform(30000, 60000)
            }
            for i in range(30)
        ]
    }

def generate_mock_forecast_data(model_type: str, horizon: int):
    return {
        "id": str(uuid.uuid4()),
        "dataset_id": datasets_db[0]["id"],
        "dataset_name": datasets_db[0]["name"],
        "model_type": model_type,
        "horizon": horizon,
        "accuracy": random.uniform(85, 95),
        "mse": random.uniform(0.001, 0.01),
        "mae": random.uniform(100, 500),
        "rmse": random.uniform(10, 50),
        "predictions": [
            {
                "date": (datetime.now() + timedelta(days=i)).isoformat(),
                "predicted_value": random.uniform(12000, 18000),
                "confidence_lower": random.uniform(10000, 15000),
                "confidence_upper": random.uniform(15000, 22000)
            }
            for i in range(horizon)
        ],
        "created_at": datetime.now().isoformat()
    }

# API Routes

@app.get("/api/v1/datasets")
async def get_datasets():
    return {"data": datasets_db}

@app.get("/api/v1/datasets/{dataset_id}")
async def get_dataset(dataset_id: str):
    dataset = next((d for d in datasets_db if d["id"] == dataset_id), None)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset

@app.get("/api/v1/datasets/{dataset_id}/preview")
async def get_dataset_preview(dataset_id: str, page: int = 1, limit: int = 50):
    dataset = next((d for d in datasets_db if d["id"] == dataset_id), None)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Generate mock preview data
    records = []
    for i in range(min(limit, 100)):
        if dataset["name"] == "Sales Data":
            records.append({
                "date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
                "sales": random.uniform(8000, 25000),
                "region": random.choice(["North", "South", "East", "West"]),
                "product": random.choice(["Product A", "Product B", "Product C"]),
                "revenue": random.uniform(20000, 80000)
            })
        else:
            records.append({
                "customer_id": f"CUST_{1000+i}",
                "age": random.randint(18, 80),
                "purchase_amount": random.uniform(50, 500),
                "category": random.choice(["Electronics", "Clothing", "Books"]),
                "timestamp": (datetime.now() - timedelta(hours=i)).isoformat()
            })
    
    return {
        "records": records,
        "total": dataset["row_count"],
        "columns": dataset["columns"]
    }

@app.get("/api/v1/analytics/summary")
async def get_analytics_summary():
    return {
        "total_datasets": len(datasets_db),
        "datasets_change": 12.5,
        "active_forecasts": len(forecasts_db),
        "forecasts_change": 8.3,
        "total_data_points": sum(d["row_count"] for d in datasets_db),
        "data_points_change": 15.7,
        "average_accuracy": 89.5,
        "accuracy_change": 2.1
    }

@app.get("/api/v1/datasets/{dataset_id}/analytics")
async def get_dataset_analytics(dataset_id: str):
    dataset = next((d for d in datasets_db if d["id"] == dataset_id), None)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    return generate_mock_analytics_data()

@app.post("/api/v1/analytics/forecast")
async def create_forecast(forecast_request: dict):
    dataset_id = forecast_request.get("dataset_id")
    model_type = forecast_request.get("model_type", "linear_regression")
    horizon = forecast_request.get("horizon", 30)
    
    dataset = next((d for d in datasets_db if d["id"] == dataset_id), None)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    forecast = generate_mock_forecast_data(model_type, horizon)
    forecasts_db.append(forecast)
    
    return forecast

@app.get("/api/v1/analytics/forecasts/recent")
async def get_recent_forecasts():
    return sorted(forecasts_db, key=lambda x: x["created_at"], reverse=True)[:10]

@app.get("/api/v1/analytics/models/compare")
async def get_model_comparison(dataset_id: Optional[str] = None):
    return [
        {
            "model_type": "linear_regression",
            "accuracy": 87.5,
            "mse": 0.0045,
            "mae": 234.5,
            "rmse": 15.3,
            "count": 12
        },
        {
            "model_type": "arima",
            "accuracy": 91.2,
            "mse": 0.0032,
            "mae": 189.7,
            "rmse": 13.8,
            "count": 8
        },
        {
            "model_type": "moving_average",
            "accuracy": 84.3,
            "mse": 0.0067,
            "mae": 298.4,
            "rmse": 18.9,
            "count": 15
        }
    ]

@app.get("/api/v1/analytics/models/stats")
async def get_model_stats():
    return [
        {
            "model_type": "linear_regression",
            "total_forecasts": 25,
            "average_accuracy": 87.5,
            "average_mse": 0.0045,
            "success_rate": 96.0
        },
        {
            "model_type": "arima",
            "total_forecasts": 18,
            "average_accuracy": 91.2,
            "average_mse": 0.0032,
            "success_rate": 94.4
        },
        {
            "model_type": "moving_average",
            "total_forecasts": 32,
            "average_accuracy": 84.3,
            "average_mse": 0.0067,
            "success_rate": 98.1
        }
    ]

# WebSocket endpoint for real-time data (simplified)
@app.get("/api/v1/ws/live-data")
async def websocket_info():
    return {
        "message": "WebSocket endpoint available",
        "url": "ws://localhost:8000/api/v1/ws/live-data",
        "status": "available"
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/")
async def root():
    return {
        "message": "InsightDash API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting InsightDash Backend Server...")
    print("API Documentation: http://localhost:8000/docs")
    print("Frontend should connect to: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
