"""
Prediction Service for Bhoomijal
"""
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database.models import MonitoringStation, Observation, PredictionRecord
from backend.app.services.groundwater_service import find_nearest_or_interpolate
from ml.predict import generate_6month_prediction

def get_station_prediction(
    db: Session,
    station_id: str,
    rainfall_scenario: str = "normal"
) -> Optional[dict]:
    """Generates 6-month prediction for a specific monitoring station."""
    stn = db.query(MonitoringStation).filter(MonitoringStation.station_id == station_id).first()
    if not stn:
        return None

    latest_obs = (
        db.query(Observation)
        .filter(Observation.station_id == station_id)
        .order_by(desc(Observation.observation_date))
        .first()
    )

    baseline_depth = latest_obs.depth_to_water_level_m if latest_obs else 12.0
    recent_rainfall = latest_obs.rainfall_mm if latest_obs else 35.0

    pred_result = generate_6month_prediction(
        lat=stn.latitude,
        lng=stn.longitude,
        recent_depth_m=baseline_depth,
        recent_rainfall_mm=recent_rainfall,
        rainfall_scenario=rainfall_scenario
    )

    pred_result["station_id"] = stn.station_id
    pred_result["station_name"] = stn.station_name
    pred_result["latitude"] = stn.latitude
    pred_result["longitude"] = stn.longitude

    return pred_result

def get_coordinate_prediction(
    db: Session,
    lat: float,
    lng: float,
    rainfall_scenario: str = "normal"
) -> dict:
    """Generates instant 6-month prediction when user clicks ANY location on the map."""
    spatial_info = find_nearest_or_interpolate(db, lat, lng)
    
    pred_result = generate_6month_prediction(
        lat=lat,
        lng=lng,
        recent_depth_m=spatial_info["estimated_depth_m"],
        recent_rainfall_mm=40.0,
        rainfall_scenario=rainfall_scenario
    )

    pred_result["station_id"] = spatial_info.get("nearest_station_id")
    pred_result["station_name"] = f"Near {spatial_info.get('nearest_station_name')} ({spatial_info.get('distance_km')} km away)"
    pred_result["latitude"] = lat
    pred_result["longitude"] = lng
    pred_result["confidence"] = spatial_info.get("confidence")

    return pred_result
