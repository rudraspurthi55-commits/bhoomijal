# Machine Learning Methodology

## 1. Objective
Predict groundwater depth (meters below ground level - bgl) 1 to 6 months into the future to enable preventative agricultural water planning.

## 2. Feature Engineering
- **Spatial Coordinates**: `latitude`, `longitude`
- **Autoregressive Lag Depths**:
  - `depth_lag_1m`: Observation 1 month prior
  - `depth_lag_2m`: Observation 2 months prior
  - `depth_lag_3m`: Observation 3 months prior
- **Rainfall Features**:
  - `rainfall_mm`: Concurrent precipitation
  - `rainfall_3m_avg`: 90-day moving average representing delayed recharge
- **Cyclical Trigonometric Seasonality**:
  - `month_sin = sin(2 * pi * month / 12)`
  - `month_cos = cos(2 * pi * month / 12)`
- **Hydrogeological Recharge Index**:
  - Scaled weight reflecting peak Indian monsoon percolation (July-September).

## 3. Training & Validation
- **Time-based Split**: To avoid temporal data leakage, records are sorted chronologically with the first 80% used for model training and the final 20% reserved for out-of-sample evaluation.
- **Algorithm**: Calibrated `RandomForestRegressor` (`n_estimators=100`, `max_depth=8`, `min_samples_split=4`, `min_samples_leaf=2`).
- **Achieved Test Metrics**:
  - **RMSE**: 1.0959 meters
  - **MAE**: 0.8001 meters
  - **R² Score**: 0.9826

## 4. Multi-Step Recursive Forecast
During forward inference, predicted depths for Month $t$ are fed back into lag inputs for Month $t+1$. An increasing uncertainty margin (4% to 16%) is computed across the 6-month horizon to provide upper (P90) and lower (P10) confidence bounds.
