"""
Data Management, Ingestion, and Status API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from backend.app.database.connection import get_db
from backend.app.services.data_update_service import (
    get_data_status, import_csv_observations, trigger_retrain_from_db
)

router = APIRouter(prefix="/data", tags=["Data Ingestion & Integrity"])

@router.get("/status")
def check_data_status(db: Session = Depends(get_db)):
    """Provides observation freshness timestamps, station totals, and ingestion audits."""
    return get_data_status(db)

@router.get("/sources")
def list_data_sources():
    """Lists transparent data lineage, authority sources, and collection cadence."""
    return [
        {
            "id": "cgwb_telemetry",
            "name": "Central Ground Water Board (CGWB) Telemetry",
            "type": "National Hydrogeological Monitoring Wells",
            "coverage": "Pan-India Observation Wells",
            "cadence": "Monthly / Seasonal Water Table Depth (m bgl)",
            "status": "Simulated CGWB Schema Ingestion"
        },
        {
            "id": "imd_rainfall",
            "name": "India Meteorological Department (IMD) Grid",
            "type": "Gridded Precipitation Observations",
            "coverage": "District / Taluk Level Precipitation",
            "cadence": "Daily / Monthly Cumulative (mm)",
            "status": "Hydrological Simulation Model"
        },
        {
            "id": "grace_satellite",
            "name": "NASA / ISRO GRACE Gravity Anomaly Estimates",
            "type": "Subsurface Terrestrial Water Storage",
            "coverage": "Basin-Scale Aquifer Depletion Indices",
            "cadence": "Monthly Anomalies",
            "status": "Regional Calibration Reference"
        }
    ]

@router.post("/import")
async def upload_csv_data(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Validates and ingests user-uploaded groundwater observation CSV.
    Checks for negative depths, invalid dates, missing columns, and duplicates.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported.")

    content = await file.read()
    result = import_csv_observations(db, content, file.filename)
    if not result.get("success"):
        raise HTTPException(status_code=422, detail=result)
    return result

@router.post("/retrain")
def retrain_model_endpoint(db: Session = Depends(get_db)):
    """Triggers ML model retraining on all validated database observations."""
    result = trigger_retrain_from_db(db)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result
