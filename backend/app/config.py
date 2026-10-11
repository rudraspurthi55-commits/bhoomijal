"""
Application Configuration for Bhoomijal
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    PROJECT_NAME: str = "Bhoomijal"
    PROJECT_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/bhoomijal.db")
    
    # ML Models
    MODEL_DIR: Path = BASE_DIR / "models"
    MODEL_PATH: Path = MODEL_DIR / "groundwater_predictor.joblib"
    METRICS_PATH: Path = MODEL_DIR / "model_metrics.json"
    
    # Data Paths
    DATA_DIR: Path = BASE_DIR / "data"
    SAMPLE_DIR: Path = DATA_DIR / "sample"
    RAW_DIR: Path = DATA_DIR / "raw"
    
    # Flags
    SIMULATION_MODE: bool = True
    ALLOW_ORIGINS: list = ["*"]

settings = Settings()
