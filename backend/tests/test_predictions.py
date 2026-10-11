"""
Tests for 6-Month Groundwater Prediction Engine
"""
import pytest
from ml.predict import generate_6month_prediction, categorize_depth

def test_categorize_depth():
    assert categorize_depth(5.0)["status"] == "Safe"
    assert categorize_depth(12.0)["status"] == "Moderate"
    assert categorize_depth(18.0)["status"] == "Critical"
    assert categorize_depth(30.0)["status"] == "Severe Depletion"

def test_6month_prediction_structure_and_bounds():
    res = generate_6month_prediction(
        lat=17.5,
        lng=78.5,
        recent_depth_m=14.0,
        recent_rainfall_mm=45.0,
        rainfall_scenario="normal"
    )

    assert "forecasts" in res
    assert len(res["forecasts"]) == 6
    assert res["baseline_depth_m"] == 14.0
    assert "disclaimer" in res

    for fc in res["forecasts"]:
        assert 1 <= fc["horizon_month"] <= 6
        assert fc["lower_bound_m"] <= fc["predicted_depth_m"]
        assert fc["predicted_depth_m"] <= fc["upper_bound_m"]
        assert fc["predicted_depth_m"] > 0
        assert "advisory" in fc
        assert "en" in fc["advisory"]
        assert "te" in fc["advisory"]
        assert "hi" in fc["advisory"]

def test_low_rainfall_scenario_increases_depletion():
    normal_res = generate_6month_prediction(lat=17.5, lng=78.5, recent_depth_m=12.0, rainfall_scenario="normal")
    dry_res = generate_6month_prediction(lat=17.5, lng=78.5, recent_depth_m=12.0, rainfall_scenario="low_rainfall")

    # In low rainfall scenario, groundwater table depth should be deeper (or equal) than normal
    assert dry_res["end_depth_m"] >= normal_res["end_depth_m"]
