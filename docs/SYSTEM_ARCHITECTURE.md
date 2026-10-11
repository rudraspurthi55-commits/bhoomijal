# Bhoomijal System Architecture

## Overview
Bhoomijal (भूजल / భూమిజల్) is an AI-powered groundwater intelligence and 6-month seasonal forecasting platform designed for smallholder farmers and water basin planners.

```
+-------------------------------------------------------------------------+
|                          CLIENT PRESENTATION                            |
|  React 18 + Tailwind CSS + Leaflet GIS + Dynamic i18n (EN / TE / HI)    |
+------------------------------------+------------------------------------+
                                     |  HTTP REST / JSON
                                     v
+------------------------------------+------------------------------------+
|                      FASTAPI BACKEND SERVICE                            |
|   /api/locations  |  /api/predictions  |  /api/observations  |  /api/data |
+------------------+--------------------+-------------------+---------------+
                   |                    |                   |
                   v                    v                   v
+------------------+---+      +---------+---------+   +-----+-------------+
|   SQLITE DATABASE    |      | MACHINE LEARNING  |   | CSV INGESTION &   |
| Monitoring Stations  |      | Random Forest     |   | INTEGRITY ENGINE  |
| Observations Time-   |      | Recursive 6-Month |   | Negative Depths   |
| Series & Metadata    |      | Forecaster        |   | Deduplication     |
+----------------------+      +-------------------+   +-------------------+
```

## Architectural Layers
1. **Frontend Presentation**:
   - Single-Page Web Architecture with 7 modular views (`Home`, `Dashboard`, `GroundwaterMapPage`, `PredictionLab`, `StoryMode`, `DataMethodology`, `AdminDataManager`).
   - Dynamic 3-language switcher (English, Telugu, Hindi) translating all strings, metrics, tooltips, and farmer advisory tips without reload.
   - Interactive Leaflet map supporting click-anywhere spatial querying via Haversine great-circle distance interpolation.

2. **Backend API (FastAPI)**:
   - High performance asynchronous Python API with automatic OpenAPI Swagger documentation (`/docs`).
   - Clean layer separation: API routes (`backend/app/api`), business services (`backend/app/services`), schemas (`backend/app/schemas`), and database models (`backend/app/database`).

3. **Machine Learning Pipeline (`ml/`)**:
   - Time-series aware 80/20 train/test split.
   - Scikit-learn Random Forest Regressor trained on 10 lag, spatial, and cyclical seasonal features.
   - Recursive multi-step forward inference engine producing 6-month projections with uncertainty intervals (P10 to P90).

4. **Data Integrity & Governance**:
   - Rejects negative depths, nulls, and duplicate timestamps.
   - Transparent simulated vs real data flags.
   - Preservation of existing model artifacts if retraining yields invalid results.
