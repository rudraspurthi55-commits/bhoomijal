"""
Feature Engineering and Preprocessing Pipeline for Bhoomijal
Transforms raw time-series observations into lag and seasonal feature matrices.
"""
import numpy as np
import pandas as pd
from typing import Tuple, List, Optional
from ml.model_config import FEATURE_COLUMNS, TARGET_COLUMN

def compute_seasonal_features(dates: pd.Series) -> Tuple[pd.Series, pd.Series, pd.Series]:
    """
    Computes cyclical month features and Indian monsoon recharge index.
    """
    months = dates.dt.month
    month_sin = np.sin(2 * np.pi * months / 12.0)
    month_cos = np.cos(2 * np.pi * months / 12.0)
    
    # In the Indian Subcontinent, Monsoon recharge peaks July-October (months 7, 8, 9, 10)
    # Post-monsoon stabilizes (11, 12, 1), Pre-monsoon dries up (3, 4, 5, 6)
    def recharge_weight(m):
        if m in [7, 8, 9]:
            return 1.0  # Peak monsoon recharge
        elif m in [10, 11]:
            return 0.7  # Post-monsoon high table
        elif m in [12, 1, 2]:
            return 0.4  # Winter steady state
        else:
            return 0.1  # Summer pre-monsoon extraction peak

    recharge_index = months.map(recharge_weight)
    return month_sin, month_cos, recharge_index

def build_features(df: pd.DataFrame, station_metadata: Optional[pd.DataFrame] = None) -> pd.DataFrame:
    """
    Constructs ML-ready features from observation data.
    Assumes df has ['station_id', 'observation_date', 'depth_to_water_level_m', 'rainfall_mm'].
    """
    df = df.copy()
    df["observation_date"] = pd.to_datetime(df["observation_date"])
    df = df.sort_values(by=["station_id", "observation_date"]).reset_index(drop=True)

    # Attach coordinates if available
    if station_metadata is not None:
        meta_dict = station_metadata.set_index("station_id")[["latitude", "longitude"]].to_dict("index")
        df["latitude"] = df["station_id"].map(lambda sid: meta_dict.get(sid, {}).get("latitude", 17.3850))
        df["longitude"] = df["station_id"].map(lambda sid: meta_dict.get(sid, {}).get("longitude", 78.4867))
    else:
        if "latitude" not in df.columns:
            df["latitude"] = 17.3850  # Default central Deccan Plateau coords
        if "longitude" not in df.columns:
            df["longitude"] = 78.4867

    # Grouped lag features per station
    feature_dfs = []
    for sid, group in df.groupby("station_id"):
        group = group.copy()
        
        # 1, 2, 3 month lagged depths
        group["depth_lag_1m"] = group["depth_to_water_level_m"].shift(1)
        group["depth_lag_2m"] = group["depth_to_water_level_m"].shift(2)
        group["depth_lag_3m"] = group["depth_to_water_level_m"].shift(3)
        
        # Rolling rainfall
        group["rainfall_3m_avg"] = group["rainfall_mm"].rolling(window=3, min_periods=1).mean()
        
        # Fill missing initial lags with backfill/group median
        group["depth_lag_1m"] = group["depth_lag_1m"].bfill().fillna(group["depth_to_water_level_m"])
        group["depth_lag_2m"] = group["depth_lag_2m"].bfill().fillna(group["depth_lag_1m"])
        group["depth_lag_3m"] = group["depth_lag_3m"].bfill().fillna(group["depth_lag_2m"])
        
        feature_dfs.append(group)

    featured_df = pd.concat(feature_dfs, ignore_index=True)

    # Seasonality
    sin_feat, cos_feat, rech_feat = compute_seasonal_features(featured_df["observation_date"])
    featured_df["month_sin"] = sin_feat
    featured_df["month_cos"] = cos_feat
    featured_df["seasonal_recharge_index"] = rech_feat

    return featured_df
