"""
Machine Learning Configuration for Bhoomijal
Groundwater Level Prediction Engine
"""
from pathlib import Path

# Directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
SAMPLE_DATA_DIR = DATA_DIR / "sample"
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "groundwater_predictor.joblib"
METRICS_PATH = MODEL_DIR / "model_metrics.json"

# Features used for model training and prediction
FEATURE_COLUMNS = [
    "latitude",
    "longitude",
    "depth_lag_1m",
    "depth_lag_2m",
    "depth_lag_3m",
    "rainfall_mm",
    "rainfall_3m_avg",
    "month_sin",
    "month_cos",
    "seasonal_recharge_index"
]

TARGET_COLUMN = "depth_to_water_level_m"

# Prediction horizon (months ahead)
PREDICTION_HORIZONS = [1, 2, 3, 4, 5, 6]

# Aquifer thresholds (Depth in meters below ground level - bgl)
# In Indian hydrogeology (CGWB standards):
# < 8m bgl: Safe (sufficient water for open wells & shallow borewells)
# 8m - 15m bgl: Semi-critical / Moderate (medium depth stress)
# 15m - 25m bgl: Critical (high stress, borewell deepening risks)
# > 25m bgl: Over-exploited / Severe depletion (emergency arrangement needed)
THRESHOLDS = {
    "safe": 8.0,
    "moderate": 15.0,
    "critical": 25.0
}

# Validation constraints
MIN_WATER_DEPTH_M = 0.5    # meters below ground level
MAX_WATER_DEPTH_M = 120.0  # max realistic measurement depth in hard rock / alluvial aquifers
MIN_RAINFALL_MM = 0.0
MAX_RAINFALL_MM = 2000.0

RANDOM_STATE = 42
TEST_SIZE_RATIO = 0.2
