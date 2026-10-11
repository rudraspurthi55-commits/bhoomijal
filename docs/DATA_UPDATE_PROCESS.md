# Data Update & Ingestion Process

## 1. Automated Validation Pipeline
When a new CSV file is ingested via `POST /api/data/import` or CLI (`python scripts/update_data.py <file>`):
1. **Schema Check**: Confirms existence of `station_id`, `observation_date`, `depth_to_water_level_m`, and `rainfall_mm`.
2. **Boundary Validation**:
   - Rejects negative depth values (`depth <= 0`).
   - Caps unrealistic depths (> 150m).
   - Coerces negative rainfall to `0.0`.
3. **Deduplication**: Discards older duplicate observations for the same station on the same date.
4. **Audit Logging**: Saves record counts (ingested, valid, rejected) into the `data_imports` database table.

## 2. Decoupled Retraining Policy
- New observations do not immediately trigger automatic retrains to prevent training instability.
- Retraining is triggered manually via the Admin Data Manager or batch cron job when significant new valid records are available.
- **Fail-Safe Mechanism**: If retraining fails, the existing valid serialized model (`models/groundwater_predictor.joblib`) is preserved.
