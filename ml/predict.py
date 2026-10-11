"""
Prediction Engine for Bhoomijal
Produces 6-month forward recursive forecasts with uncertainty bands,
aquifer risk ratings, and agricultural actionable guidance.
"""
import os
import joblib
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from pathlib import Path

from ml.model_config import (
    MODEL_PATH, FEATURE_COLUMNS, THRESHOLDS, PREDICTION_HORIZONS
)
from ml.preprocessing import compute_seasonal_features

def categorize_depth(depth_m: float) -> dict:
    """Categorizes groundwater depth into standard hydrogeological safety stages."""
    if depth_m < THRESHOLDS["safe"]:
        return {
            "status": "Safe",
            "color": "emerald",
            "code": "SAFE",
            "severity": 1,
            "badge": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        }
    elif depth_m < THRESHOLDS["moderate"]:
        return {
            "status": "Moderate",
            "color": "amber",
            "code": "MODERATE",
            "severity": 2,
            "badge": "bg-amber-500/20 text-amber-400 border-amber-500/30"
        }
    elif depth_m < THRESHOLDS["critical"]:
        return {
            "status": "Critical",
            "color": "orange",
            "code": "CRITICAL",
            "severity": 3,
            "badge": "bg-orange-500/20 text-orange-400 border-orange-500/30"
        }
    else:
        return {
            "status": "Severe Depletion",
            "color": "rose",
            "code": "SEVERE",
            "severity": 4,
            "badge": "bg-rose-500/20 text-rose-400 border-rose-500/30"
        }

def get_actionable_advisory(depth_m: float, trend_diff_m: float, horizon_month: int) -> dict:
    """
    Generates actionable advice for farmers (like Ravi) in English, Telugu, and Hindi.
    """
    if depth_m < 8.0:
        return {
            "en": "Water table is healthy. Suitable for standard crop cycle. Maintain water harvesting channels.",
            "te": "భూగర్భ జలాలు పుష్కలంగా ఉన్నాయి. సాధారణ పంటలకు అనుకూలం. వర్షపు నీటి నిల్వ మార్గాలను నిర్వహించండి.",
            "hi": "भूजल स्तर सुरक्षित है। सामान्य फसलों के लिए उपयुक्त। वर्षा जल संचयन नालियों को बनाए रखें।"
        }
    elif depth_m < 15.0:
        if trend_diff_m > 1.0:
            return {
                "en": f"Moderate depth (+{trend_diff_m:.1f}m decline). Recommended: Switch to drip/sprinkler irrigation and mulching.",
                "te": f"మధ్యస్థ లోతు (+{trend_diff_m:.1f}మీ తగ్గుదల). బిందు సేద్యం (డ్రిప్) లేదా తుంపర సేద్యం వాడండి.",
                "hi": f"मध्यम स्तर (+{trend_diff_m:.1f}मी गिरावट)। ड्रिप सिंचाई और मल्चिंग अपनाने की सलाह दी जाती है।"
            }
        else:
            return {
                "en": "Stable moderate level. Inspect borewell pump efficiency and avoid midday flood irrigation.",
                "te": "నిలకడైన మధ్యస్థ స్థాయి. బోరుబావి పంపు సామర్థ్యాన్ని తనిఖీ చేయండి, మధ్యాహ్న సమయాల్లో నీరు పెట్టవద్దు.",
                "hi": "स्थिर मध्यम स्तर। बोरवेल पंप की जांच करें और दोपहर में अधिक पानी देने से बचें।"
            }
    elif depth_m < 25.0:
        return {
            "en": f"Critical depth (+{trend_diff_m:.1f}m drop). Plan 6 months ahead: Transition to millets/pulses, arrange farm pond backup.",
            "te": f"తీవ్ర లోతు (+{trend_diff_m:.1f}మీ లోతుకి వెళ్ళింది). 6 నెలల ముందు జాగ్రత్త: తక్కువ నీటి చిరుధాన్యాలు వేయండి, ఫామ్ పాండ్ ఏర్పాటు చేయండి.",
            "hi": f"गंभीर जलस्तर (+{trend_diff_m:.1f}मी गिरावट)। 6 महीने पहले तैयारी करें: मोटे अनाज/दालें बोएं और खेत के तालाब की व्यवस्था करें।"
        }
    else:
        return {
            "en": "Severe water depletion! Borewell failure risk is high. Coordinate community water supply & recharge shafts immediately.",
            "te": "తీవ్రమైన నీటి ఎద్దడి! బోరుబావి ఎండిపోయే ప్రమాదం ఉంది. సామూహిక నీటి ఏర్పాట్లు మరియు ఇంకుడు గుంతలు తవ్వించండి.",
            "hi": "अत्यधिक भूजल संकट! बोरवेल सूखने का भारी खतरा। तुरंत सामुदायिक जल व्यवस्था और भूजल पुनर्भरण शाफ्ट बनाएं।"
        }

def generate_6month_prediction(
    lat: float,
    lng: float,
    recent_depth_m: float,
    recent_rainfall_mm: float = 40.0,
    rainfall_scenario: str = "normal"  # "normal", "low_rainfall" (-30%), "high_rainfall" (+30%)
) -> dict:
    """
    Generates a 6-month sequential recursive forecast.
    Uses trained model if present; falls back to hydrogeological physics baseline if not yet trained.
    """
    model = None
    if MODEL_PATH.exists():
        try:
            model = joblib.load(MODEL_PATH)
        except Exception:
            model = None

    now = datetime.now()
    forecasts = []
    
    current_depth = float(recent_depth_m)
    lag1 = current_depth
    lag2 = current_depth * 0.98
    lag3 = current_depth * 0.97
    
    # Scenario rainfall multiplier
    rain_multiplier = 1.0
    if rainfall_scenario == "low_rainfall":
        rain_multiplier = 0.7
    elif rainfall_scenario == "high_rainfall":
        rain_multiplier = 1.3

    for m in range(1, 7):
        target_date = now + timedelta(days=30 * m)
        date_series = pd.Series([target_date])
        sin_f, cos_f, rech_f = compute_seasonal_features(date_series)
        
        # Indian seasonal rainfall expectation
        month_idx = target_date.month
        if month_idx in [6, 7, 8, 9]:
            base_rain = 180.0
        elif month_idx in [10, 11]:
            base_rain = 45.0
        else:
            base_rain = 10.0
        expected_rain = base_rain * rain_multiplier
        avg_3m_rain = (expected_rain + recent_rainfall_mm) / 2.0

        if model is not None:
            input_row = pd.DataFrame([{
                "latitude": lat,
                "longitude": lng,
                "depth_lag_1m": lag1,
                "depth_lag_2m": lag2,
                "depth_lag_3m": lag3,
                "rainfall_mm": expected_rain,
                "rainfall_3m_avg": avg_3m_rain,
                "month_sin": float(sin_f.iloc[0]),
                "month_cos": float(cos_f.iloc[0]),
                "seasonal_recharge_index": float(rech_f.iloc[0])
            }])[FEATURE_COLUMNS]
            pred_depth = float(model.predict(input_row)[0])
        else:
            # Hydrogeological water-balance approximation
            # Recharge pulls water table closer to surface (reduces depth)
            # Evapotranspiration & summer extraction increases depth
            extraction_factor = 0.8 if month_idx in [3, 4, 5, 6] else 0.3
            recharge_effect = (rech_f.iloc[0] * expected_rain * 0.015)
            seasonal_delta = extraction_factor - recharge_effect
            pred_depth = lag1 + seasonal_delta

        # Constrain to physically realistic bounds
        pred_depth = max(1.0, min(100.0, pred_depth))
        
        # Uncertainty band (+/- 6% to 15% as horizon increases)
        uncertainty_margin = round(pred_depth * (0.04 + 0.02 * m), 2)
        lower_bound = max(0.5, round(pred_depth - uncertainty_margin, 2))
        upper_bound = round(pred_depth + uncertainty_margin, 2)
        
        diff_from_current = round(pred_depth - current_depth, 2)
        status_info = categorize_depth(pred_depth)
        advisory = get_actionable_advisory(pred_depth, diff_from_current, m)

        forecasts.append({
            "horizon_month": m,
            "target_date": target_date.strftime("%Y-%m-%d"),
            "month_name": target_date.strftime("%B %Y"),
            "predicted_depth_m": round(pred_depth, 2),
            "lower_bound_m": lower_bound,
            "upper_bound_m": upper_bound,
            "depth_change_m": diff_from_current,
            "status": status_info["status"],
            "status_color": status_info["color"],
            "status_badge": status_info["badge"],
            "severity": status_info["severity"],
            "advisory": advisory
        })

        # Recursive update
        lag3 = lag2
        lag2 = lag1
        lag1 = pred_depth

    # 6-Month overall trend
    final_depth = forecasts[-1]["predicted_depth_m"]
    total_change = round(final_depth - current_depth, 2)
    overall_risk = categorize_depth(final_depth)

    return {
        "generated_at": datetime.utcnow().isoformat(),
        "baseline_depth_m": round(current_depth, 2),
        "end_depth_m": round(final_depth, 2),
        "total_change_m": total_change,
        "is_depleting": total_change > 0,
        "scenario": rainfall_scenario,
        "overall_risk": overall_risk["status"],
        "overall_badge": overall_risk["badge"],
        "disclaimer": "Model-generated estimates for proactive water planning. Not a physical sensor guarantee.",
        "forecasts": forecasts
    }
