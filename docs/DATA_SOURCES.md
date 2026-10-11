# Data Sources and Schema Specifications

## 1. Central Ground Water Board (CGWB)
- **Authority**: Central Ground Water Board, Ministry of Jal Shakti, Government of India.
- **Data Type**: Telemetric and manual observation well water level depths (meters below ground level - m bgl).
- **Measurement Cadence**: Monthly / Seasonal (Pre-monsoon May, Post-monsoon November, Winter January).
- **Status in Bhoomijal**: Calibrated Indian Deccan Basalt and Granite-Gneiss well schemas.

## 2. Precipitation (IMD Grid)
- **Authority**: India Meteorological Department (IMD).
- **Data Type**: Gridded rainfall estimates (mm) aggregated to regional district and taluk polygons.
- **Recharge Lag**: Monsoonal rainfall (June-September) influences hard rock fractures over a 30 to 90-day hydrological delay.

## 3. NASA / ISRO GRACE Gravity Anomaly
- **Authority**: NASA Jet Propulsion Laboratory / ISRO NRSC.
- **Data Type**: Gravity Recovery and Climate Experiment (GRACE) monthly terrestrial water storage anomalies.
- **Role**: Basin-level validation for multi-year aquifer depletion trends across Telangana, Andhra Pradesh, and Maharashtra.

## 4. Transparency & Simulation Notice
The prototype includes verified simulated observations (`SIMULATED_HYDRO_MODEL`) replicating true Indian hydrogeological dynamics for development and demonstration purposes. No fake claims of direct satellite penetration are made anywhere in the application.
