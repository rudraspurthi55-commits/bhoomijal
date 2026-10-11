"""
Script to generate hydrogeologically realistic groundwater observation records
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

stations = [
    ("STN-IN-TS-01", 12.5),
    ("STN-IN-TS-02", 9.2),
    ("STN-IN-TS-03", 19.8),
    ("STN-IN-TS-04", 6.8),
    ("STN-IN-TS-05", 14.1),
    ("STN-IN-AP-01", 24.5),
    ("STN-IN-AP-02", 11.3),
    ("STN-IN-AP-03", 16.7),
    ("STN-IN-MH-01", 22.4),
    ("STN-IN-MH-02", 18.1),
    ("STN-IN-KA-01", 27.6),
    ("STN-IN-RJ-01", 38.2)
]

records = []
start_date = datetime(2023, 1, 1)

for sid, base_depth in stations:
    current_depth = base_depth
    for month_offset in range(36):  # 3 years of monthly data
        obs_date = start_date + timedelta(days=30 * month_offset)
        m = obs_date.month
        
        # Indian monsoon rainfall (July to September high, rest low)
        if m in [7, 8, 9]:
            rainfall = np.random.uniform(140.0, 310.0)
            recharge = rainfall * 0.018  # Recharges water table by 2-5m
            extraction = 0.3
        elif m in [10, 11]:
            rainfall = np.random.uniform(30.0, 80.0)
            recharge = rainfall * 0.010
            extraction = 0.5
        elif m in [12, 1, 2]:
            rainfall = np.random.uniform(0.0, 15.0)
            recharge = 0.05
            extraction = 0.7
        else: # March, April, May, June (Summer / pre-monsoon)
            rainfall = np.random.uniform(0.0, 25.0)
            recharge = 0.02
            extraction = 1.3 # Heavy extraction for summer crops & heat

        # Water level changes: extraction increases depth, recharge decreases depth
        current_depth = current_depth + extraction - recharge + np.random.normal(0, 0.2)
        current_depth = max(2.0, min(90.0, current_depth))

        records.append({
            "station_id": sid,
            "observation_date": obs_date.strftime("%Y-%m-%d"),
            "depth_to_water_level_m": round(current_depth, 2),
            "rainfall_mm": round(rainfall, 1),
            "temperature_c": round(np.random.uniform(24.0, 39.0), 1),
            "source": "SIMULATED_HYDRO_MODEL"
        })

df = pd.DataFrame(records)
df.to_csv("C:/Users/RUDRA SPURTHI/.gemini/antigravity/scratch/bhoomijal/data/sample/sample_observations.csv", index=False)
print(f"Generated {len(df)} realistic groundwater observation records.")
