# Bhoomijal (భూమిజల్ / भूमिजल) 💧
### AI-Powered Groundwater Intelligence & 6-Month Seasonal Prediction Platform

Bhoomijal helps farmers, water managers, and communities anticipate aquifer depletion, plan borewell usage, and prepare water harvesting before crisis strikes.

---

## 🚀 Key Features

* **6-Month Advance Groundwater Forecasts**: Multi-step recursive ML forecasting engine with uncertainty bands (P10 to P90).
* **Click-Anywhere Map**: Interactive Leaflet map — click anywhere across India to instantly calculate local water table depth and 6-month trajectory via spatial Haversine interpolation.
* **3-Language Inclusion**: Instant live switcher for **English**, **Telugu (తెలుగు)**, and **Hindi (हिंदी)** for grassroots farmer accessibility.
* **Farmer Ravi's Decision Story**: Interactive case study demonstrating how 6-month warning saves crops and prevents borewell drilling debt.
* **Rigorous Data Quality Pipeline**: Automated ingestion rejecting negative depths, invalid dates, and duplicate records.
* **Complete Scientific Transparency**: Explicit separation of simulated prototype data vs real telemetry, and zero false claims of direct underground scanning.

---

## 📂 Project Architecture

```
bhoomijal/
├── README.md                 # Complete documentation & run guide
├── vercel.json               # Vercel serverless deployment configuration
├── docker-compose.yml        # Docker container orchestration
├── .gitignore                # Git exclusions
├── .env.example              # Environment variables template
│
├── api/
│   └── index.py              # Vercel Python serverless entrypoint
│
├── frontend/
│   ├── package.json          # React + Vite dependencies
│   ├── vite.config.js        # Vite build & proxy config
│   ├── tailwind.config.js    # Themed colors (navy, teal, dark)
│   ├── index.html            # Frontend entrypoint
│   │
│   ├── dist/
│   │   └── index.html        # Zero-install standalone bundle (served by FastAPI)
│   │
│   └── src/
│       ├── App.jsx           # Main state & page router
│       ├── main.jsx          # React DOM render
│       ├── components/       # Reusable UI cards, maps, charts, navigation
│       ├── pages/            # 7 Application views (Dashboard, Map, Story, etc.)
│       ├── locales/          # English (en), Telugu (te), Hindi (hi) i18n
│       └── services/         # API integration client
│
├── backend/
│   ├── requirements.txt      # Python dependencies
│   ├── app/
│   │   ├── main.py           # FastAPI server & route registration
│   │   ├── config.py         # App configuration
│   │   ├── api/              # Endpoints (locations, predictions, data)
│   │   ├── services/         # Business logic & spatial calculations
│   │   ├── database/         # SQLite models & connection session
│   │   └── schemas/          # Pydantic data schemas
│   └── tests/                # 14 Comprehensive pytest integration tests
│
├── ml/
│   ├── data_validation.py    # CSV cleaning & negative depth rejection
│   ├── preprocessing.py      # Lag & cyclical trigonometric feature engineering
│   ├── train.py              # Time-series 80/20 train-test split & Random Forest
│   ├── evaluate.py           # Evaluation diagnostics (RMSE, MAE, R²)
│   ├── predict.py            # Recursive 6-month forward forecast engine
│   └── model_config.py       # Aquifer threshold constants & hyperparameters
│
├── data/
│   ├── sample/               # 12 Sample stations & 432 monthly observations
│   ├── raw/                  # Uploaded CSV audit storage
│   └── processed/            # Cleaned feature datasets
│
├── models/
│   ├── groundwater_predictor.joblib  # Serialized trained model artifact
│   └── model_metrics.json            # Model evaluation metrics (R²: 0.9826)
│
├── scripts/
│   ├── import_data.py        # Database initialization & sample seeding
│   ├── validate_data.py      # CSV validation CLI tool
│   └── update_data.py        # Ingestion & model retrain trigger
│
└── docs/                     # Scientific methodology & architecture specifications
```

---

## ⚡ Quick Start: Running Locally (Windows PowerShell)

### Step 1: Open Terminal in the Bhoomijal Directory
```powershell
cd "C:\Users\RUDRA SPURTHI\.gemini\antigravity\scratch\bhoomijal"
```

### Step 2: Install Python Dependencies
```powershell
python -m pip install -r backend/requirements.txt
```

### Step 3: Initialize Database & Train Initial Model
*(Already pre-initialized with 12 stations & 432 observations, but can be re-run anytime)*:
```powershell
python scripts/import_data.py
python scripts/update_data.py
```

### Step 4: Run the Application
```powershell
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Now open **`http://localhost:8000`** in your browser!
The interactive dashboard, 3-language toggles, Leaflet map, and 6-month prediction lab will load immediately!

---

## 🧪 Running Automated Tests

Run the full automated test suite (14 passing tests):
```powershell
python -m pytest backend/tests -v
```

All 14 tests verify:
- API health and CORS endpoints
- Click-anywhere coordinate lookups
- 6-month recursive prediction horizons
- Rejection of negative depth values
- Duplicate record removal
- Model performance metrics

---

## 🌐 How to Push to GitHub & Deploy to Vercel (Free 24/7)

### 1. Open the project in VS Code
Open VS Code and choose **File > Open Folder** and select:
`C:\Users\RUDRA SPURTHI\.gemini\antigravity\scratch\bhoomijal`

### 2. Initialize Git & Push to GitHub
In the VS Code terminal (or PowerShell):
```powershell
git init
git add .
git commit -m "Initial commit: Bhoomijal Groundwater Intelligence Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bhoomijal.git
git push -u origin main
```

### 3. Deploy to Vercel (1-Click)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New Project"** and import your `bhoomijal` repository.
3. Vercel automatically detects the included `vercel.json` and configures the Python Serverless backend and frontend static builds.
4. Click **Deploy**! Your application will be live 24/7 globally.

---

## 📜 Scientific Disclaimer
> **Estimates, Not Guarantees:** Bhoomijal estimates groundwater depths based on observation trends, rainfall indices, and historical lags. It does not physically penetrate or measure deep underground subterranean reserves. Predictions are intended for proactive agricultural water planning.
