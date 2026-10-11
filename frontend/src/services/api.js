/**
 * Bhoomijal Frontend API Client
 * Seamlessly interfaces with FastAPI backend routes
 */

const API_BASE = '/api';

export async function fetchLocations() {
  const res = await fetch(`${API_BASE}/locations`);
  if (!res.ok) throw new Error('Failed to load groundwater monitoring stations');
  return res.json();
}

export async function fetchLocationDetails(stationId) {
  const res = await fetch(`${API_BASE}/locations/${stationId}`);
  if (!res.ok) throw new Error(`Failed to load details for station ${stationId}`);
  return res.json();
}

export async function fetchLocationByCoordinates(lat, lng) {
  const res = await fetch(`${API_BASE}/locations/by-coordinates?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error('Failed to query coordinates');
  return res.json();
}

export async function fetchStationPredictions(stationId, scenario = 'normal') {
  const res = await fetch(`${API_BASE}/predictions/station/${stationId}?scenario=${scenario}`);
  if (!res.ok) throw new Error(`Failed to generate prediction for ${stationId}`);
  return res.json();
}

export async function fetchCoordinatePredictions(lat, lng, scenario = 'normal') {
  const res = await fetch(`${API_BASE}/predictions/by-coordinates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: lat, longitude: lng, rainfall_scenario: scenario })
  });
  if (!res.ok) throw new Error('Failed to compute coordinate prediction');
  return res.json();
}

export async function fetchDataStatus() {
  const res = await fetch(`${API_BASE}/data/status`);
  if (!res.ok) throw new Error('Failed to fetch data status');
  return res.json();
}

export async function fetchDataSources() {
  const res = await fetch(`${API_BASE}/data/sources`);
  if (!res.ok) throw new Error('Failed to fetch data sources');
  return res.json();
}

export async function fetchModelMetrics() {
  const res = await fetch(`${API_BASE}/predictions/model/metrics`);
  if (!res.ok) throw new Error('Failed to load model metrics');
  return res.json();
}

export async function uploadDataCSV(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/data/import`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail?.error || 'CSV upload failed');
  }
  return res.json();
}

export async function triggerRetrain() {
  const res = await fetch(`${API_BASE}/data/retrain`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Retraining failed');
  }
  return res.json();
}
