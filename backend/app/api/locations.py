"""
Locations and Monitoring Stations API Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.services.groundwater_service import (
    get_all_stations, get_station_details, find_nearest_or_interpolate
)

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("", response_model=List[dict])
def list_locations(db: Session = Depends(get_db)):
    """List all registered groundwater monitoring stations with current status."""
    return get_all_stations(db)

@router.get("/by-coordinates")
def query_by_coordinates(
    lat: float = Query(..., description="Latitude coordinate"),
    lng: float = Query(..., description="Longitude coordinate"),
    db: Session = Depends(get_db)
):
    """
    Finds nearest station or computes interpolated groundwater depth
    for any arbitrary click location on the map.
    """
    return find_nearest_or_interpolate(db, lat, lng)

@router.get("/{station_id}")
def get_location_by_id(station_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed station metadata and historical observations."""
    station = get_station_details(db, station_id)
    if not station:
        raise HTTPException(status_code=404, detail=f"Station '{station_id}' not found.")
    return station
