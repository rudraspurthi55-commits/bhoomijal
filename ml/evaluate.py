"""
Model Evaluation and Diagnostics for Bhoomijal
"""
import json
import os
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from ml.model_config import MODEL_PATH, METRICS_PATH, FEATURE_COLUMNS, TARGET_COLUMN
from ml.preprocessing import build_features

def get_model_metrics() -> dict:
    """Reads saved model metrics or returns default un-trained status."""
    if not METRICS_PATH.exists():
        return {
            "status": "not_trained",
            "message": "No trained model found. Run training pipeline or use initial baseline.",
            "metrics": {"rmse": None, "mae": None, "r2_score": None}
        }
    try:
        with open(METRICS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        return {"status": "error", "message": str(e)}

def evaluate_on_data(model, test_df: pd.DataFrame) -> dict:
    """Computes real-time evaluation metrics on an arbitrary test set."""
    X = test_df[FEATURE_COLUMNS]
    y = test_df[TARGET_COLUMN]
    y_pred = model.predict(X)

    rmse = float(np.sqrt(mean_squared_error(y, y_pred)))
    mae = float(mean_absolute_error(y, y_pred))
    r2 = float(r2_score(y, y_pred))

    return {
        "samples_evaluated": len(test_df),
        "rmse": round(rmse, 4),
        "mae": round(mae, 4),
        "r2_score": round(r2, 4)
    }
