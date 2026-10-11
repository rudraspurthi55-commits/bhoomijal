"""
Database Seeding Script for Bhoomijal
Initializes SQLite schema and loads sample stations and observations.
"""
import sys
import pandas as pd
from pathlib import Path
from datetime import datetime

# Setup paths
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.app.database.connection import engine, SessionLocal, init_db
from backend.app.database.models import MonitoringStation, Observation, DataImportLog
from ml.data_validation import validate_dataframe

def seed():
    print("Initializing Bhoomijal Database schema...")
    init_db()
    db = SessionLocal()

    stations_csv = BASE_DIR / "data" / "sample" / "sample_groundwater_stations.csv"
    obs_csv = BASE_DIR / "data" / "sample" / "sample_observations.csv"

    # 1. Seed Stations
    if stations_csv.exists():
        stn_df = pd.read_csv(stations_csv)
        print(f"Loading {len(stn_df)} monitoring stations...")
        for _, row in stn_df.iterrows():
            sid = str(row["station_id"])
            existing = db.query(MonitoringStation).filter(MonitoringStation.station_id == sid).first()
            if not existing:
                stn = MonitoringStation(
                    station_id=sid,
                    station_name=str(row["station_name"]),
                    state=str(row["state"]),
                    district=str(row["district"]),
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    aquifer_type=str(row.get("aquifer_type", "Alluvium / Hard Rock")),
                    total_depth_m=float(row.get("total_depth_m", 50.0)),
                    status=str(row.get("status", "Active"))
                )
                db.add(stn)
        db.commit()
        print("Stations loaded successfully.")

    # 2. Seed Observations
    if obs_csv.exists():
        obs_df = pd.read_csv(obs_csv)
        print(f"Validating and seeding {len(obs_df)} observations...")
        is_valid, issues, clean_df = validate_dataframe(obs_df)
        if is_valid:
            added = 0
            for _, row in clean_df.iterrows():
                sid = str(row["station_id"])
                obs_date = pd.to_datetime(row["observation_date"])
                existing = db.query(Observation).filter(
                    Observation.station_id == sid,
                    Observation.observation_date == obs_date
                ).first()
                if not existing:
                    obs = Observation(
                        station_id=sid,
                        observation_date=obs_date,
                        depth_to_water_level_m=float(row["depth_to_water_level_m"]),
                        rainfall_mm=float(row.get("rainfall_mm", 0.0)),
                        temperature_c=float(row.get("temperature_c", 28.0)),
                        source=str(row.get("source", "SAMPLE_SEED")),
                        ingested_at=datetime.utcnow()
                    )
                    db.add(obs)
                    added += 1
            db.commit()
            print(f"Inserted {added} observations successfully.")

            # Log import
            log = DataImportLog(
                filename="sample_observations.csv",
                rows_ingested=len(obs_df),
                rows_valid=len(clean_df),
                rows_rejected=len(obs_df) - len(clean_df),
                status="SUCCESS",
                error_log="; ".join(issues) if issues else None
            )
            db.add(log)
            db.commit()
        else:
            print(f"Observation validation failed: {issues}")

    db.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed()
