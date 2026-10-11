# Raw Data Ingestion

This directory stores uploaded or imported raw CSV files from external sources (e.g. CGWB telemetry data, India WRIS, or local agricultural monitoring sensors).

- Any file uploaded via the Admin Data Manager `/api/data/import` is saved with a timestamped audit prefix.
- Never manually edit raw files directly to maintain data lineage and reproducible pipelines.
