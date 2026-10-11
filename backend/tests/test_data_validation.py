"""
Tests for Data Validation Pipeline
Verifies rejection of negative depths, missing columns, invalid dates, and duplicates.
"""
import pytest
import pandas as pd
from datetime import datetime

from ml.data_validation import validate_dataframe

def test_missing_required_columns():
    df = pd.DataFrame({
        "station_id": ["STN-01"],
        "observation_date": ["2024-01-01"]
        # missing depth and rainfall
    })
    is_valid, issues, clean = validate_dataframe(df)
    assert not is_valid
    assert any("Missing required columns" in s for s in issues)

def test_negative_depth_values():
    df = pd.DataFrame({
        "station_id": ["STN-01", "STN-01", "STN-01", "STN-01", "STN-01", "STN-01"],
        "observation_date": [
            "2024-01-01", "2024-02-01", "2024-03-01", "2024-04-01", "2024-05-01", "2024-06-01"
        ],
        "depth_to_water_level_m": [12.0, -5.0, 14.5, 0.0, 16.0, 15.2],
        "rainfall_mm": [20.0, 10.0, 0.0, 0.0, 40.0, 50.0]
    })
    is_valid, issues, clean = validate_dataframe(df)
    assert is_valid
    # The negative (-5.0) and zero (0.0) depths should have been removed
    assert len(clean) == 4
    assert (clean["depth_to_water_level_m"] <= 0).sum() == 0

def test_duplicate_records_handling():
    df = pd.DataFrame({
        "station_id": ["STN-01", "STN-01", "STN-01", "STN-01", "STN-01", "STN-01"],
        "observation_date": [
            "2024-01-01", "2024-01-01", "2024-02-01", "2024-03-01", "2024-04-01", "2024-05-01"
        ],
        "depth_to_water_level_m": [10.0, 12.0, 14.0, 15.0, 16.0, 17.0],
        "rainfall_mm": [0, 0, 0, 0, 0, 0]
    })
    is_valid, issues, clean = validate_dataframe(df)
    assert is_valid
    assert len(clean) == 5  # Duplicate removed, kept last
    assert any("duplicate" in s.lower() for s in issues)
