import React, { useState } from 'react';
import PredictionCard from '../components/PredictionCard';
import GroundwaterChart from '../components/GroundwaterChart';
import LoadingState from '../components/LoadingState';
import { fetchStationPredictions } from '../services/api';

export default function PredictionLab({ stations = [], selectedStation, onSelectStation, prediction, setPrediction, currentLang, t }) {
  const [scenario, setScenario] = useState('normal');
  const [loading, setLoading] = useState(false);

  const handleRunPrediction = async () => {
    if (!selectedStation) return;
    setLoading(true);
    try {
      const res = await fetchStationPredictions(selectedStation.station_id, scenario);
      setPrediction(res);
    } catch (err) {
      console.error("Failed to run prediction:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Simulation Controls Panel */}
      <div className="bg-[#132A44] border border-[#244771] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E3E62]">
          <div>
            <span className="text-xs uppercase tracking-wider text-teal-400 font-bold">
              Predictive Hydrogeology Laboratory
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              {t.prediction.title}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {t.prediction.subtitle}
            </p>
          </div>

          <button
            onClick={handleRunPrediction}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-cyan-400 transition-all disabled:opacity-50"
          >
            {loading ? "Calculating Forecast..." : `⚡ ${t.prediction.runBtn}`}
          </button>
        </div>

        {/* Configuration Row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Station Selection */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">
              Select Monitoring Aquifer:
            </label>
            <select
              value={selectedStation?.station_id || ''}
              onChange={(e) => {
                const found = stations.find(s => s.station_id === e.target.value);
                if (found) onSelectStation(found);
              }}
              className="w-full bg-[#0B192C] border border-[#244771] text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-teal-400"
            >
              {stations.map(s => (
                <option key={s.station_id} value={s.station_id}>
                  {s.station_name} ({s.district}) - {s.latest_depth_m}m bgl
                </option>
              ))}
            </select>
          </div>

          {/* Rainfall Scenario Toggle */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">
              {t.prediction.scenarioLabel}:
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-[#0B192C] p-1 rounded-xl border border-[#244771]">
              <button
                onClick={() => setScenario('normal')}
                className={`py-1.5 text-[11px] rounded-lg font-medium transition-colors ${
                  scenario === 'normal' ? 'bg-teal-500 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setScenario('low_rainfall')}
                className={`py-1.5 text-[11px] rounded-lg font-medium transition-colors ${
                  scenario === 'low_rainfall' ? 'bg-amber-500 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Deficit (-30%)
              </button>
              <button
                onClick={() => setScenario('high_rainfall')}
                className={`py-1.5 text-[11px] rounded-lg font-medium transition-colors ${
                  scenario === 'high_rainfall' ? 'bg-cyan-500 text-white font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Surplus (+30%)
              </button>
            </div>
          </div>

          {/* Aquifer Baseline Snapshot */}
          <div className="bg-[#0E2034] border border-[#1E3E62] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Current Baseline Depth</span>
              <span className="text-xl font-black text-white">
                {selectedStation?.latest_depth_m} <span className="text-xs font-normal text-gray-400">m bgl</span>
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${selectedStation?.status_badge}`}>
              {selectedStation?.status_category}
            </span>
          </div>
        </div>
      </div>

      {loading && <LoadingState message="Simulating 6-month recursive groundwater dynamics..." />}

      {/* Trajectory Hydrograph */}
      {prediction && !loading && (
        <div className="bg-[#132A44] border border-[#244771] rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span>📈</span> {t.prediction.trajectory}
          </h3>
          <GroundwaterChart
            historical={selectedStation?.recent_observations || []}
            predictions={prediction.forecasts}
            stationName={selectedStation?.station_name}
          />
        </div>
      )}

      {/* Prediction Cards */}
      {prediction && !loading && (
        <PredictionCard
          prediction={prediction}
          currentLang={currentLang}
          t={t}
        />
      )}
    </div>
  );
}
