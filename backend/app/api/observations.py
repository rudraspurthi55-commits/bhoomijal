"""
Observations API Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database.connection import get_db
from backend.app.database.models import Observation

router = APIRouter(prefix="/observations", tags=["Observations"])

@router.get("/recent")
def get_recent_observations(
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Retrieve most recent recorded groundwater observations across all stations."""
    obs_list = (
        db.query(Observation)
        .order_by(desc(Observation.observation_date))
        .limit(limit)
        .all()
    )
    return [
        {
            "id": o.id,
            "station_id": o.station_id,
            "observation_date": o.observation_date.strftime("%Y-%m-%d"),
            "depth_to_water_level_m": o.depth_to_water_level_m,
            "rainfall_mm": o.rainfall_mm,
            "temperature_c": o.temperature_c,
            "source": o.source,
            "ingested_at": o.ingested_at.isoformat()
        }
        for o in obs_list
    ]

@router.get("/station/{station_id}")
def get_station_observations(
    station_id: str,
    limit: int = Query(36, ge=1, le=120),
    db: Session = Depends(get_db)
):
    """Retrieve chronological observations for a specific monitoring well."""
    obs_list = (
        db.query(Observation)
        .filter(Observation.station_id == station_id)
        .order_by(Observation.observation_date.asc())
        .limit(limit)
        .all()
    )
    if not obs_list:
        raise HTTPException(status_code=404, detail=f"No observations found for station {station_id}")
        
    return [
        {
            "id": o.id,
            "station_id": o.station_id,
            "observation_date": o.observation_date.strftime("%Y-%m-%d"),
            "depth_to_water_level_m": o.depth_to_water_level_m,
            "rainfall_mm": o.rainfall_mm,
            "temperature_c": o.temperature_c
        }
        for o in obs_list
    ]
