"""
Data Validation Pipeline for Bhoomijal
Verifies structural and statistical integrity of groundwater and rainfall datasets.
"""
from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np
from datetime import datetime

REQUIRED_COLUMNS = [
    "station_id",
    "observation_date",
    "depth_to_water_level_m",
    "rainfall_mm"
]

def validate_dataframe(df: pd.DataFrame) -> Tuple[bool, List[str], pd.DataFrame]:
    """
    Validates an ingested groundwater observation dataframe.
    Returns:
        (is_valid: bool, issues: List[str], cleaned_df: pd.DataFrame)
    """
    issues = []
    
    # 1. Column existence check
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        return False, [f"Missing required columns: {', '.join(missing_cols)}"], pd.DataFrame()

    cleaned = df.copy()

    # 2. Date format and validity
    try:
        cleaned["observation_date"] = pd.to_datetime(cleaned["observation_date"], errors="coerce")
        invalid_dates = cleaned["observation_date"].isna().sum()
        if invalid_dates > 0:
            issues.append(f"Found {invalid_dates} rows with invalid dates; they were dropped.")
            cleaned = cleaned.dropna(subset=["observation_date"])
    except Exception as e:
        return False, [f"Fatal date parsing error: {str(e)}"], pd.DataFrame()

    # 3. Numeric conversion and negative depth validation
    cleaned["depth_to_water_level_m"] = pd.to_numeric(cleaned["depth_to_water_level_m"], errors="coerce")
    cleaned["rainfall_mm"] = pd.to_numeric(cleaned["rainfall_mm"], errors="coerce").fillna(0.0)

    # Groundwater depth checks
    invalid_depths = cleaned["depth_to_water_level_m"].isna() | (cleaned["depth_to_water_level_m"] <= 0)
    invalid_depth_count = invalid_depths.sum()
    if invalid_depth_count > 0:
        issues.append(f"Found {invalid_depth_count} invalid or negative groundwater depth values; removed.")
        cleaned = cleaned[~invalid_depths]

    # Extreme outlier check (> 150m)
    extreme_outliers = cleaned["depth_to_water_level_m"] > 150.0
    if extreme_outliers.sum() > 0:
        issues.append(f"Found {extreme_outliers.sum()} extreme groundwater depth outliers (>150m); capped.")
        cleaned.loc[extreme_outliers, "depth_to_water_level_m"] = 150.0

    # Negative rainfall
    negative_rain = cleaned["rainfall_mm"] < 0
    if negative_rain.sum() > 0:
        issues.append(f"Found {negative_rain.sum()} negative rainfall values; set to 0.0.")
        cleaned.loc[negative_rain, "rainfall_mm"] = 0.0

    # 4. Duplicate checks
    duplicates = cleaned.duplicated(subset=["station_id", "observation_date"])
    duplicate_count = duplicates.sum()
    if duplicate_count > 0:
        issues.append(f"Found {duplicate_count} duplicate station/date records; kept latest.")
        cleaned = cleaned.drop_duplicates(subset=["station_id", "observation_date"], keep="last")

    # 5. Check if enough rows remain
    if len(cleaned) < 3:
        return False, issues + ["Insufficient valid records after cleaning (minimum 3 required)."], pd.DataFrame()

    cleaned = cleaned.sort_values(by=["station_id", "observation_date"]).reset_index(drop=True)
    return True, issues, cleaned
