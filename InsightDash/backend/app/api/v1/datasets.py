from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ...core.database import get_db
from ...models import models, schemas
from ...core.dependencies import get_current_user
from ...services.cache import redis_service

router = APIRouter()


from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ...core.database import get_db
from ...models import models, schemas
from ...core.dependencies import get_current_user
from ...services.cache import redis_service
from datetime import datetime

router = APIRouter()


@router.get("/", response_model=List[dict])
async def get_datasets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Get all datasets - returning mock data for now"""
    # Return mock datasets data for frontend testing
    mock_datasets = [
        {
            "id": "1",
            "name": "Sales Data",
            "description": "Monthly sales data for 2024",
            "file_type": "csv",
            "row_count": 1250,
            "column_count": 8,
            "file_size": 125000,
            "status": "active",
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-12-01T14:20:00Z",
            "columns": [
                {"name": "date", "type": "datetime"},
                {"name": "sales", "type": "number"},
                {"name": "region", "type": "string"},
                {"name": "product", "type": "string"},
                {"name": "quantity", "type": "integer"},
                {"name": "revenue", "type": "number"},
                {"name": "cost", "type": "number"},
                {"name": "profit", "type": "number"}
            ],
            "is_public": False
        },
        {
            "id": "2",
            "name": "Customer Analytics",
            "description": "Customer behavior and engagement metrics",
            "file_type": "csv",
            "row_count": 3200,
            "column_count": 12,
            "file_size": 256000,
            "status": "active",
            "created_at": "2024-02-10T15:45:00Z",
            "updated_at": "2024-12-15T09:30:00Z",
            "columns": [
                {"name": "customer_id", "type": "string"},
                {"name": "signup_date", "type": "datetime"},
                {"name": "age", "type": "integer"},
                {"name": "gender", "type": "string"},
                {"name": "location", "type": "string"},
                {"name": "total_purchases", "type": "number"},
                {"name": "avg_order_value", "type": "number"},
                {"name": "last_purchase_date", "type": "datetime"},
                {"name": "loyalty_score", "type": "number"},
                {"name": "churn_risk", "type": "number"},
                {"name": "preferred_category", "type": "string"},
                {"name": "marketing_channel", "type": "string"}
            ],
            "is_public": True
        },
        {
            "id": "3",
            "name": "IoT Sensor Data",
            "description": "Real-time sensor readings from factory floors",
            "file_type": "csv",
            "row_count": 50000,
            "column_count": 6,
            "file_size": 2500000,
            "status": "active",
            "created_at": "2024-03-01T08:00:00Z",
            "updated_at": datetime.utcnow().isoformat(),
            "columns": [
                {"name": "timestamp", "type": "datetime"},
                {"name": "sensor_id", "type": "string"},
                {"name": "temperature", "type": "number"},
                {"name": "humidity", "type": "number"},
                {"name": "pressure", "type": "number"},
                {"name": "vibration", "type": "number"}
            ],
            "is_public": False
        }
    ]
    
    return mock_datasets[skip:skip+limit]


@router.get("/{dataset_id}", response_model=schemas.Dataset)
async def get_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a specific dataset"""
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Check access permissions
    if not dataset.is_public and dataset.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return dataset


@router.post("/", response_model=schemas.Dataset)
async def create_dataset(
    dataset: schemas.DatasetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new dataset"""
    db_dataset = models.Dataset(
        **dataset.dict(),
        owner_id=current_user.id
    )
    
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    
    return db_dataset


@router.put("/{dataset_id}", response_model=schemas.Dataset)
async def update_dataset(
    dataset_id: int,
    dataset_update: schemas.DatasetUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update a dataset"""
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Check ownership
    if dataset.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update fields
    for field, value in dataset_update.dict(exclude_unset=True).items():
        setattr(dataset, field, value)
    
    db.commit()
    db.refresh(dataset)
    
    return dataset


@router.delete("/{dataset_id}")
async def delete_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a dataset"""
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Check ownership
    if dataset.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(dataset)
    db.commit()
    
    return {"message": "Dataset deleted successfully"}


@router.get("/{dataset_id}/data", response_model=List[schemas.DataPoint])
async def get_dataset_data(
    dataset_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get data points for a dataset"""
    # Check if dataset exists and user has access
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    if not dataset.is_public and dataset.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get data points
    data_points = db.query(models.DataPoint).filter(
        models.DataPoint.dataset_id == dataset_id
    ).offset(skip).limit(limit).all()
    
    return data_points


@router.post("/{dataset_id}/data", response_model=schemas.DataPoint)
async def add_data_point(
    dataset_id: int,
    data_point: schemas.DataPointCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Add a data point to a dataset"""
    # Check if dataset exists and user has access
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    if dataset.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Parse timestamp if provided as string
    timestamp = None
    if data_point.timestamp:
        from datetime import datetime
        try:
            timestamp = datetime.fromisoformat(data_point.timestamp.replace('Z', '+00:00'))
        except:
            timestamp = datetime.now()
    else:
        timestamp = datetime.now()
    
    # Create data point
    db_data_point = models.DataPoint(
        dataset_id=dataset_id,
        timestamp=timestamp,
        value=data_point.value,
        meta_data=data_point.meta_data
    )
    
    db.add(db_data_point)
    db.commit()
    db.refresh(db_data_point)
    
    return db_data_point
