"""
Predictions and Machine Learning Inference API Endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.schemas.predictions import PredictionResponse, CoordinateQueryRequest
from backend.app.services.prediction_service import (
    get_station_prediction, get_coordinate_prediction
)
from ml.evaluate import get_model_metrics

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.get("/station/{station_id}", response_model=PredictionResponse)
def predict_for_station(
    station_id: str,
    scenario: str = Query("normal", pattern="^(normal|low_rainfall|high_rainfall)$"),
    db: Session = Depends(get_db)
):
    """
    Returns 6-month ahead groundwater forecast for a specified monitoring station,
    including month-by-month trajectory, confidence bands, and farmer advisory.
    """
    result = get_station_prediction(db, station_id, rainfall_scenario=scenario)
    if not result:
        raise HTTPException(status_code=404, detail=f"Station '{station_id}' not found.")
    return result

@router.post("/by-coordinates", response_model=PredictionResponse)
def predict_by_coordinates(
    payload: CoordinateQueryRequest,
    db: Session = Depends(get_db)
):
    """
    Instantaneous 6-month groundwater prediction for arbitrary click coordinates on the map.
    """
    return get_coordinate_prediction(
        db,
        lat=payload.latitude,
        lng=payload.longitude,
        rainfall_scenario=payload.rainfall_scenario or "normal"
    )

@router.get("/model/metrics")
def get_prediction_model_metrics():
    """Returns active model evaluation metrics (RMSE, MAE, R², Feature Importances)."""
    return get_model_metrics()
