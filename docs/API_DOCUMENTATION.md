# Bhoomijal API Documentation

The Bhoomijal backend provides OpenAPI-compliant endpoints accessible at `http://localhost:8000/docs`.

### Health & Status
- `GET /api/health`: Service health check.
- `GET /api/data/status`: Observation counts, latest ingestion timestamp, and data lineage mode.
- `GET /api/data/sources`: Descriptions of external data providers.

### Monitoring Locations
- `GET /api/locations`: Lists all observation stations with coordinates and current depth.
- `GET /api/locations/{station_id}`: Retrieves complete station metadata and chronological observations.
- `GET /api/locations/by-coordinates?lat={lat}&lng={lng}`: Calculates distance to nearest observation station and provides instant interpolated water table depth.

### Predictions & Machine Learning
- `GET /api/predictions/station/{station_id}?scenario={normal|low_rainfall|high_rainfall}`: Generates 6-month recursive forecast with uncertainty intervals and farmer guidance.
- `POST /api/predictions/by-coordinates`: Instant 6-month forecast for arbitrary map coordinates.
- `GET /api/predictions/model/metrics`: Model evaluation statistics (RMSE, MAE, R², Feature Importances).

### Data Ingestion
- `POST /api/data/import`: Accepts CSV multipart upload, executes validation rules, and commits clean records.
- `POST /api/data/retrain`: Triggers model retraining on all current database observations.
