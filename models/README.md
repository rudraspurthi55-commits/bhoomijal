# Trained Model Storage

Stores machine learning model binaries and diagnostic metrics:
- `groundwater_predictor.joblib`: Serialized Scikit-Learn Random Forest regressor with calibrated seasonal dynamics.
- `model_metrics.json`: Records RMSE, MAE, R-squared evaluation metrics, feature importances, and dataset hash for reproducibility.
