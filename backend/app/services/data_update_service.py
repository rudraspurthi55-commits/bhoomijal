"""
Data Update and Import Ingestion Service for Bhoomijal
"""
import io
from datetime import datetime
from typing import Dict, Any, Tuple
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from backend.app.database.models import MonitoringStation, Observation, DataImportLog
from ml.data_validation import validate_dataframe
from ml.train import train_model

def get_data_status(db: Session) -> dict:
    """Returns database freshness, record counts, and ingestion timestamps."""
    total_stations = db.query(MonitoringStation).count()
    total_observations = db.query(Observation).count()

    latest_obs = db.query(Observation).order_by(desc(Observation.observation_date)).first()
    latest_ingest = db.query(Observation).order_by(desc(Observation.ingested_at)).first()
    latest_import = db.query(DataImportLog).order_by(desc(DataImportLog.created_at)).first()

    return {
        "status": "healthy",
        "total_monitoring_stations": total_stations,
        "total_observations": total_observations,
        "latest_observation_date": latest_obs.observation_date.strftime("%Y-%m-%d") if latest_obs else None,
        "latest_ingested_at": latest_ingest.ingested_at.isoformat() if latest_ingest else None,
        "latest_import_job": {
            "filename": latest_import.filename if latest_import else None,
            "status": latest_import.status if latest_import else None,
            "rows_valid": latest_import.rows_valid if latest_import else 0,
            "imported_at": latest_import.created_at.isoformat() if latest_import else None
        } if latest_import else None,
        "data_mode": "Hybrid (Central Ground Water Board schema + Hydrogeological Ingestion Engine)",
        "is_simulated": True,
        "disclaimer": "Includes simulated hydrologic monitoring data for prototype demonstration."
    }

def import_csv_observations(db: Session, csv_content: bytes, filename: str) -> dict:
    """
    Validates and imports observation CSV into SQLite.
    Creates stations if they don't exist yet.
    """
    try:
        df = pd.read_csv(io.BytesIO(csv_content))
    except Exception as e:
        log_entry = DataImportLog(
            filename=filename,
            rows_ingested=0,
            rows_valid=0,
            rows_rejected=0,
            status="FAILED",
            error_log=f"CSV Parsing failure: {str(e)}"
        )
        db.add(log_entry)
        db.commit()
        return {"success": False, "error": f"Invalid CSV file format: {str(e)}"}

    total_rows = len(df)
    is_valid, issues, clean_df = validate_dataframe(df)

    if not is_valid:
        log_entry = DataImportLog(
            filename=filename,
            rows_ingested=total_rows,
            rows_valid=0,
            rows_rejected=total_rows,
            status="FAILED",
            error_log="; ".join(issues)
        )
        db.add(log_entry)
        db.commit()
        return {"success": False, "error": "Validation failed", "issues": issues}

    imported_count = 0
    rejected_count = total_rows - len(clean_df)

    # Ingest rows
    for _, row in clean_df.iterrows():
        sid = str(row["station_id"])
        
        # Ensure station exists
        stn = db.query(MonitoringStation).filter(MonitoringStation.station_id == sid).first()
        if not stn:
            stn = MonitoringStation(
                station_id=sid,
                station_name=f"Monitoring Station {sid}",
                state="Telangana",
                district="Regional",
                latitude=float(row.get("latitude", 17.5)),
                longitude=float(row.get("longitude", 78.5)),
                aquifer_type="Hardrock Gneiss",
                total_depth_m=60.0
            )
            db.add(stn)
            db.flush()

        obs_date = pd.to_datetime(row["observation_date"])

        # Check existing
        existing = db.query(Observation).filter(
            Observation.station_id == sid,
            Observation.observation_date == obs_date
        ).first()

        if existing:
            existing.depth_to_water_level_m = float(row["depth_to_water_level_m"])
            existing.rainfall_mm = float(row.get("rainfall_mm", 0.0))
            existing.temperature_c = float(row.get("temperature_c", 28.0))
            existing.ingested_at = datetime.utcnow()
        else:
            new_obs = Observation(
                station_id=sid,
                observation_date=obs_date,
                depth_to_water_level_m=float(row["depth_to_water_level_m"]),
                rainfall_mm=float(row.get("rainfall_mm", 0.0)),
                temperature_c=float(row.get("temperature_c", 28.0)),
                source="USER_CSV_UPLOAD",
                ingested_at=datetime.utcnow()
            )
            db.add(new_obs)
            imported_count += 1

    log_entry = DataImportLog(
        filename=filename,
        rows_ingested=total_rows,
        rows_valid=len(clean_df),
        rows_rejected=rejected_count,
        status="SUCCESS" if not issues else "WARNING",
        error_log="; ".join(issues) if issues else None
    )
    db.add(log_entry)
    db.commit()

    return {
        "success": True,
        "filename": filename,
        "rows_ingested": total_rows,
        "rows_valid": len(clean_df),
        "rows_rejected": rejected_count,
        "warnings": issues
    }

def trigger_retrain_from_db(db: Session) -> dict:
    """Extracts latest observations and metadata from DB and runs model training."""
    obs_query = db.query(Observation).all()
    if len(obs_query) < 15:
        return {"success": False, "error": "Insufficient records (<15) in database to train model."}

    records = [
        {
            "station_id": o.station_id,
            "observation_date": o.observation_date.strftime("%Y-%m-%d"),
            "depth_to_water_level_m": o.depth_to_water_level_m,
            "rainfall_mm": o.rainfall_mm
        }
        for o in obs_query
    ]
    obs_df = pd.DataFrame(records)

    stations = db.query(MonitoringStation).all()
    stn_df = pd.DataFrame([
        {"station_id": s.station_id, "latitude": s.latitude, "longitude": s.longitude}
        for s in stations
    ])

    try:
        metrics = train_model(obs_df, stn_df)
        return {"success": True, "metrics": metrics}
    except Exception as e:
        return {"success": False, "error": str(e)}
