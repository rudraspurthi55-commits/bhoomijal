"""
SQLAlchemy Database Models for Bhoomijal
"""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class MonitoringStation(Base):
    __tablename__ = "monitoring_stations"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String(50), unique=True, index=True, nullable=False)
    station_name = Column(String(100), nullable=False)
    state = Column(String(50), nullable=False, index=True)
    district = Column(String(50), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    aquifer_type = Column(String(100), default="Alluvium / Hard Rock")
    total_depth_m = Column(Float, default=50.0)
    status = Column(String(20), default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    observations = relationship("Observation", back_populates="station", cascade="all, delete-orphan")


class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String(50), ForeignKey("monitoring_stations.station_id"), index=True, nullable=False)
    observation_date = Column(DateTime, nullable=False, index=True)
    depth_to_water_level_m = Column(Float, nullable=False)
    rainfall_mm = Column(Float, default=0.0)
    temperature_c = Column(Float, default=28.0)
    source = Column(String(50), default="SIMULATED_HYDRO_MODEL")
    ingested_at = Column(DateTime, default=datetime.utcnow)

    station = relationship("MonitoringStation", back_populates="observations")

    __table_args__ = (
        Index("idx_station_date", "station_id", "observation_date", unique=True),
    )


class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String(50), nullable=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    baseline_depth_m = Column(Float, nullable=False)
    horizon_month = Column(Integer, nullable=False)
    target_date = Column(DateTime, nullable=False)
    predicted_depth_m = Column(Float, nullable=False)
    lower_bound_m = Column(Float, nullable=False)
    upper_bound_m = Column(Float, nullable=False)
    status_category = Column(String(30), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class DataImportLog(Base):
    __tablename__ = "data_imports"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    rows_ingested = Column(Integer, default=0)
    rows_valid = Column(Integer, default=0)
    rows_rejected = Column(Integer, default=0)
    status = Column(String(20), default="SUCCESS")  # SUCCESS, WARNING, FAILED
    error_log = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ModelRecord(Base):
    __tablename__ = "model_records"

    id = Column(Integer, primary_key=True, index=True)
    model_version = Column(String(50), nullable=False)
    algorithm = Column(String(100), nullable=False)
    rmse = Column(Float, nullable=True)
    mae = Column(Float, nullable=True)
    r2_score = Column(Float, nullable=True)
    training_samples = Column(Integer, default=0)
    status = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
