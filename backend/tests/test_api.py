"""
Integration Tests for Bhoomijal FastAPI Endpoints
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_list_locations():
    response = client.get("/api/locations")
    assert response.status_code == 200
    stations = response.json()
    assert len(stations) >= 12
    assert "station_id" in stations[0]
    assert "latest_depth_m" in stations[0]

def test_get_single_location():
    response = client.get("/api/locations/STN-IN-TS-01")
    assert response.status_code == 200
    stn = response.json()
    assert stn["station_id"] == "STN-IN-TS-01"
    assert stn["district"] == "Medak"
    assert "recent_observations" in stn

def test_query_location_by_coordinates():
    # Coords near Hyderabad / Medak
    response = client.get("/api/locations/by-coordinates?lat=17.4&lng=78.4")
    assert response.status_code == 200
    data = response.json()
    assert "estimated_depth_m" in data
    assert "nearest_station_id" in data

def test_6month_prediction_api():
    response = client.get("/api/predictions/station/STN-IN-TS-01?scenario=normal")
    assert response.status_code == 200
    data = response.json()
    assert len(data["forecasts"]) == 6
    assert data["station_id"] == "STN-IN-TS-01"

def test_coordinate_prediction_post():
    payload = {"latitude": 18.05, "longitude": 78.26, "rainfall_scenario": "normal"}
    response = client.post("/api/predictions/by-coordinates", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["forecasts"]) == 6
    assert "baseline_depth_m" in data

def test_data_status_and_sources():
    status_resp = client.get("/api/data/status")
    assert status_resp.status_code == 200
    assert status_resp.json()["total_monitoring_stations"] >= 12

    sources_resp = client.get("/api/data/sources")
    assert sources_resp.status_code == 200
    assert len(sources_resp.json()) >= 3

def test_model_metrics():
    metrics_resp = client.get("/api/predictions/model/metrics")
    assert metrics_resp.status_code == 200
    data = metrics_resp.json()
    assert "metrics" in data
    assert "rmse" in data["metrics"]
