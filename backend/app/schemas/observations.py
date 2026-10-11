"""
Pydantic Schemas for Groundwater Stations and Observations
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class StationBase(BaseModel):
    station_id: str
    station_name: str
    state: str
    district: str
    latitude: float
    longitude: float
    aquifer_type: Optional[str] = "Alluvium / Hard Rock"
    total_depth_m: Optional[float] = 50.0
    status: Optional[str] = "Active"

class StationResponse(StationBase):
    latest_depth_m: Optional[float] = None
    latest_observation_date: Optional[str] = None
    status_category: Optional[str] = "Safe"
    status_badge: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ObservationBase(BaseModel):
    station_id: str
    observation_date: datetime
    depth_to_water_level_m: float
    rainfall_mm: Optional[float] = 0.0
    temperature_c: Optional[float] = 28.0
    source: Optional[str] = "SIMULATED_HYDRO_MODEL"

class ObservationResponse(BaseModel):
    id: int
    station_id: str
    observation_date: str
    depth_to_water_level_m: float
    rainfall_mm: float
    temperature_c: float
    source: str
    model_config = ConfigDict(from_attributes=True)

class StationDetailResponse(StationResponse):
    observations_count: int
    recent_observations: List[ObservationResponse]
