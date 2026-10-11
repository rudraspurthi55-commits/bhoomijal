"""
Model Training Engine for Bhoomijal
Implements time-series aware splitting, ensemble regression, and model artifact versioning.
"""
import os
import json
import joblib
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

from ml.model_config import (
    MODEL_DIR, MODEL_PATH, METRICS_PATH,
    FEATURE_COLUMNS, TARGET_COLUMN, RANDOM_STATE, TEST_SIZE_RATIO
)
from ml.preprocessing import build_features
from ml.data_validation import validate_dataframe

def train_model(observations_df: pd.DataFrame, station_metadata: pd.DataFrame = None) -> dict:
    """
    Validates, preprocesses, and trains the groundwater prediction model.
    Returns dictionary with training status, metrics, and artifact paths.
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Validation
    is_valid, issues, clean_df = validate_dataframe(observations_df)
    if not is_valid:
        raise ValueError(f"Training data validation failed: {'; '.join(issues)}")

    # 2. Preprocessing & Feature Engineering
    featured_df = build_features(clean_df, station_metadata)
    
    # Drop rows with nulls in features/target
    featured_df = featured_df.dropna(subset=FEATURE_COLUMNS + [TARGET_COLUMN])
    if len(featured_df) < 10:
        raise ValueError("Insufficient feature rows (<10) to train a viable model.")

    # 3. Time-based split (sort by date and take earliest 80% for train, latest 20% for test)
    featured_df = featured_df.sort_values(by="observation_date").reset_index(drop=True)
    split_idx = int(len(featured_df) * (1 - TEST_SIZE_RATIO))
    
    train_df = featured_df.iloc[:split_idx]
    test_df = featured_df.iloc[split_idx:]

    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df[TARGET_COLUMN]
    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df[TARGET_COLUMN]

    # 4. Model Training: Random Forest with calibrated hyperparameters
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # 5. Evaluation
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = float(np.sqrt(mse))
    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    # Feature Importance
    importances = dict(zip(FEATURE_COLUMNS, [float(v) for v in model.feature_importances_]))
    sorted_importances = dict(sorted(importances.items(), key=lambda x: x[1], reverse=True))

    metadata = {
        "trained_at": datetime.utcnow().isoformat(),
        "total_samples": len(featured_df),
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "metrics": {
            "rmse": round(rmse, 4),
            "mae": round(mae, 4),
            "r2_score": round(r2, 4)
        },
        "feature_importances": sorted_importances,
        "feature_columns": FEATURE_COLUMNS,
        "algorithm": "RandomForestRegressor (n_estimators=100, max_depth=8)",
        "status": "active"
    }

    # 6. Save model and metrics
    joblib.dump(model, MODEL_PATH)
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    return metadata

if __name__ == "__main__":
    print("Train module ready.")
