from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ...core.database import get_db
from ...models import models, schemas
from ...core.dependencies import get_current_user
from ...services.cache import redis_service

router = APIRouter()


@router.get("/", response_model=List[schemas.Dataset])
async def get_datasets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all datasets accessible to the current user"""
    # Get datasets owned by user or public datasets
    datasets = db.query(models.Dataset).filter(
        (models.Dataset.owner_id == current_user.id) | 
        (models.Dataset.is_public == True)
    ).offset(skip).limit(limit).all()
    
    return datasets


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
