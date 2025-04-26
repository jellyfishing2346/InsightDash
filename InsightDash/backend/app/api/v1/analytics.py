from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from ...core.database import get_db
from ...models import models, schemas
from ...core.dependencies import get_current_user
from ...services.forecast import forecast_service
from ...services.cache import redis_service
from datetime import datetime, timedelta

router = APIRouter()


@router.post("/forecast/{dataset_id}", response_model=schemas.Forecast)
async def generate_forecast(
    dataset_id: int,
    target_column: str = Query(..., description="Column to forecast"),
    model_type: str = Query("arima", description="Model type: arima, linear_regression, moving_average"),
    forecast_periods: int = Query(30, ge=1, le=365, description="Number of periods to forecast"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Generate forecast for a dataset"""
    # Check if dataset exists and user has access
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    if not dataset.is_public and dataset.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check cache first
    cache_key = redis_service.get_cache_key(
        "forecast", 
        f"{dataset_id}_{target_column}_{model_type}_{forecast_periods}"
    )
    cached_forecast = await redis_service.get(cache_key)
    if cached_forecast:
        return cached_forecast
    
    # Get dataset data
    data_points = db.query(models.DataPoint).filter(
        models.DataPoint.dataset_id == dataset_id
    ).order_by(models.DataPoint.timestamp).all()
    
    if not data_points:
        raise HTTPException(status_code=400, detail="No data points found for dataset")
    
    # Prepare data for forecasting
    data_for_forecast = []
    for point in data_points:
        point_data = point.meta_data.copy() if point.meta_data else {}
        point_data['timestamp'] = point.timestamp
        point_data['value'] = point.value
        data_for_forecast.append(point_data)
    
    try:
        # Generate forecast
        forecast_result = forecast_service.generate_forecast(
            data=data_for_forecast,
            target_column=target_column,
            model_type=model_type,
            forecast_periods=forecast_periods
        )
        
        # Save forecast to database
        db_forecast = models.Forecast(
            dataset_id=dataset_id,
            model_type=forecast_result["model_type"],
            target_column=target_column,
            forecast_data=forecast_result["forecast_data"],
            confidence_interval=forecast_result.get("confidence_interval"),
            accuracy_metrics=forecast_result.get("accuracy_metrics")
        )
        
        db.add(db_forecast)
        db.commit()
        db.refresh(db_forecast)
        
        # Cache result (safe serialization)
        try:
            cache_data = {
                "id": db_forecast.id,
                "dataset_id": db_forecast.dataset_id,
                "model_type": db_forecast.model_type,
                "target_column": db_forecast.target_column,
                "forecast_data": db_forecast.forecast_data,
                "confidence_interval": db_forecast.confidence_interval,
                "accuracy_metrics": db_forecast.accuracy_metrics,
                "created_at": db_forecast.created_at.isoformat() if db_forecast.created_at else None
            }
            await redis_service.set(cache_key, cache_data, expire=3600)
        except:
            pass  # Continue without caching if it fails
        
        return db_forecast
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")


@router.get("/forecast/{dataset_id}/history", response_model=List[schemas.Forecast])
async def get_forecast_history(
    dataset_id: int,
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get forecast history for a dataset"""
    try:
        # Check if dataset exists and user has access
        dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        if not dataset.is_public and dataset.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        forecasts = db.query(models.Forecast).filter(
            models.Forecast.dataset_id == dataset_id
        ).order_by(models.Forecast.created_at.desc()).limit(limit).all()

        return forecasts
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting forecast history: {str(e)}")


@router.get("/analytics/summary/{dataset_id}")
async def get_analytics_summary(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get analytics summary for a dataset"""
    try:
        # Check if dataset exists and user has access
        dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        if not dataset.is_public and dataset.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Check cache (optional - continue if cache fails)
        cache_key = None
        cached_summary = None
        try:
            cache_key = redis_service.get_cache_key("analytics_summary", str(dataset_id))
            cached_summary = await redis_service.get(cache_key)
            if cached_summary:
                return cached_summary
        except:
            pass  # Continue without cache if Redis fails

        # Get data points count
        total_points = db.query(models.DataPoint).filter(
            models.DataPoint.dataset_id == dataset_id
        ).count()

        # Get latest data point
        latest_point = db.query(models.DataPoint).filter(
            models.DataPoint.dataset_id == dataset_id
        ).order_by(models.DataPoint.timestamp.desc()).first()

        # Get forecasts count
        forecasts_count = db.query(models.Forecast).filter(
            models.Forecast.dataset_id == dataset_id
        ).count()

        # Safely get data source
        data_source = getattr(dataset, 'data_source', 'unknown')

        summary = {
            "dataset_id": dataset_id,
            "dataset_name": dataset.name,
            "total_data_points": total_points,
            "latest_data_timestamp": latest_point.timestamp if latest_point else None,
            "total_forecasts": forecasts_count,
            "available_columns": list(latest_point.meta_data.keys()) if latest_point and latest_point.meta_data else ["value"],
            "data_source": data_source
        }

        # Cache summary (optional - continue if cache fails)
        try:
            if cache_key:
                await redis_service.set(cache_key, summary, expire=1800)  # 30 minutes
        except:
            pass  # Continue without caching if Redis fails

        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting analytics summary: {str(e)}")


@router.get("/summary", response_model=Dict[str, Any])
async def get_overall_analytics_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get overall analytics summary for the current user"""
    try:
        # Get user's datasets count
        datasets_count = db.query(models.Dataset).filter(
            models.Dataset.owner_id == current_user.id
        ).count()
        
        # Get total data points
        total_data_points = db.query(models.DataPoint).join(
            models.Dataset
        ).filter(models.Dataset.owner_id == current_user.id).count()
        
        # Get recent activity (datasets created in last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_datasets = db.query(models.Dataset).filter(
            models.Dataset.owner_id == current_user.id,
            models.Dataset.created_at >= week_ago
        ).count()
        
        return {
            "datasets_count": datasets_count,
            "total_data_points": total_data_points,
            "recent_activity": recent_datasets,
            "user_role": current_user.role,
            "last_updated": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting summary: {str(e)}")


@router.post("/forecast", response_model=Dict[str, Any])
async def create_forecast(
    forecast_request: schemas.ForecastRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a forecast for a dataset"""
    try:
        # Check if dataset exists and user has access
        dataset = db.query(models.Dataset).filter(
            models.Dataset.id == forecast_request.dataset_id
        ).first()
        
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        if not dataset.is_public and dataset.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get data points for forecasting
        data_points = db.query(models.DataPoint).filter(
            models.DataPoint.dataset_id == forecast_request.dataset_id
        ).order_by(models.DataPoint.timestamp).all()
        
        if len(data_points) < 10:
            raise HTTPException(status_code=400, detail="Need at least 10 data points for forecasting")
        
        # Prepare data for forecasting
        data_for_forecast = []
        for point in data_points:
            point_data = point.meta_data.copy() if point.meta_data else {}
            point_data['timestamp'] = point.timestamp
            point_data['value'] = point.value
            data_for_forecast.append(point_data)
        
        # Use the forecast service
        forecast_result = forecast_service.generate_forecast(
            data=data_for_forecast,
            target_column="value",
            model_type=forecast_request.model_type,
            forecast_periods=forecast_request.periods
        )
        
        # Save forecast to database
        db_forecast = models.Forecast(
            dataset_id=forecast_request.dataset_id,
            model_type=forecast_request.model_type,
            target_column="value",
            forecast_data=forecast_result["forecast_data"],
            confidence_interval=forecast_result.get("confidence_interval"),
            accuracy_metrics=forecast_result.get("accuracy_metrics")
        )
        
        db.add(db_forecast)
        db.commit()
        db.refresh(db_forecast)
        
        return {
            "forecast_id": db_forecast.id,
            "forecast": forecast_result["forecast_data"],
            "confidence_interval": forecast_result.get("confidence_interval"),
            "metrics": forecast_result.get("accuracy_metrics"),
            "model_type": forecast_request.model_type,
            "periods": forecast_request.periods
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating forecast: {str(e)}")
