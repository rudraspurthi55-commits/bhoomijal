# Bhoomijal Demonstration Guide

Follow this guide to demonstrate all platform features to stakeholders or evaluators:

### Step 1: Launch the Backend
Open PowerShell and run:
```powershell
python -m uvicorn backend.app.main:app --port 8000
```
Open your browser at `http://localhost:8000`.

### Step 2: Language Switching Demo
1. In the top-right navbar, click **తెలుగు** (Telugu) or **हिंदी** (Hindi).
2. Notice how all titles, cards, and farmer guidance strings translate instantly without page reload.
3. Switch back to **EN** (English).

### Step 3: Interactive Map & Click-Anywhere
1. Navigate to **Interactive Map** in the navbar.
2. Click any colored marker (e.g. Medak or Nizamabad) to view well metrics.
3. Click on any arbitrary point on the map. Notice how the system computes the exact GPS coordinate, identifies the closest observation well, and immediately calculates a 6-month forecast below!

### Step 4: 6-Month Prediction Laboratory
1. Navigate to **6-Month Prediction Lab**.
2. Switch the Rainfall Scenario from **Normal** to **Deficit (-30%)**.
3. Click **Compute 6-Month Forecast**.
4. Observe the deepening water table in the projected chart and the corresponding change in agricultural advice for Farmer Ravi.

### Step 5: Farmer Ravi's Story
1. Navigate to **Farmer Ravi's Story**.
2. Click through Chapters 1 to 4 to demonstrate how early predictions prevent borewell failure and crop debt.

### Step 6: Data Ingestion & Model Diagnostics
1. Navigate to **Data Manager**.
2. Click **Download Sample CSV Template**.
3. Click **Trigger Model Retraining** to demonstrate pipeline autonomy.
