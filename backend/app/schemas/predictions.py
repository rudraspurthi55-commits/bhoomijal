"""
Pydantic Schemas for Predictions and Advisory
"""
from typing import List, Optional, Dict
from pydantic import BaseModel

class AdvisorySchema(BaseModel):
    en: str
    te: str
    hi: str

class MonthForecast(BaseModel):
    horizon_month: int
    target_date: str
    month_name: str
    predicted_depth_m: float
    lower_bound_m: float
    upper_bound_m: float
    depth_change_m: float
    status: str
    status_color: str
    status_badge: str
    severity: int
    advisory: AdvisorySchema

class PredictionResponse(BaseModel):
    station_id: Optional[str] = None
    station_name: Optional[str] = None
    latitude: float
    longitude: float
    generated_at: str
    baseline_depth_m: float
    end_depth_m: float
    total_change_m: float
    is_depleting: bool
    scenario: str
    overall_risk: str
    overall_badge: str
    disclaimer: str
    forecasts: List[MonthForecast]

class CoordinateQueryRequest(BaseModel):
    latitude: float
    longitude: float
    rainfall_scenario: Optional[str] = "normal"
