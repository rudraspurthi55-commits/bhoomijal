import React, { useState } from 'react';
import GroundwaterMap from '../components/GroundwaterMap';
import PredictionCard from '../components/PredictionCard';
import LoadingState from '../components/LoadingState';
import { fetchCoordinatePredictions, fetchLocationByCoordinates } from '../services/api';

export default function GroundwaterMapPage({ stations = [], selectedStation, onSelectStation, currentLang, t }) {
  const [clickedLocation, setClickedLocation] = useState(null);
  const [locationPrediction, setLocationPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState('normal');

  const handleMapClick = async (lat, lng) => {
    setLoading(true);
    setLocationPrediction(null);
    try {
      // 1. Fetch nearest station & interpolated depth
      const spatial = await fetchLocationByCoordinates(lat, lng);
      setClickedLocation(spatial);

      // 2. Automatically compute 6-month forecast for this clicked location
      const pred = await fetchCoordinatePredictions(lat, lng, scenario);
      setLocationPrediction(pred);
    } catch (err) {
      console.error("Map query error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioChange = async (newScenario) => {
    setScenario(newScenario);
    if (clickedLocation) {
      setLoading(true);
      try {
        const pred = await fetchCoordinatePredictions(clickedLocation.latitude, clickedLocation.longitude, newScenario);
        setLocationPrediction(pred);
      } catch (err) {
        console.error("Scenario change error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Interactive Leaflet Map */}
      <GroundwaterMap
        stations={stations}
        selectedStation={selectedStation}
        onSelectStation={onSelectStation}
        onMapClickCoordinates={handleMapClick}
        t={t}
      />

      {/* Click Results Banner */}
      {clickedLocation && (
        <div className="bg-[#132A44] border border-[#244771] rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E3E62]">
            <div>
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Instant Spatial Aquifer Query Result
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Coordinates: {clickedLocation.latitude.toFixed(4)}°N, {clickedLocation.longitude.toFixed(4)}°E
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Nearest Monitored Well: <strong className="text-teal-300">{clickedLocation.nearest_station_name}</strong> ({clickedLocation.distance_km} km away)
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-[#0B192C] px-4 py-2 rounded-xl border border-[#1E3E62] text-center">
                <span className="text-[10px] text-gray-400 block uppercase">Instant Water Table</span>
                <span className="text-xl font-black text-white">
                  {clickedLocation.estimated_depth_m} <span className="text-xs text-gray-400 font-normal">m bgl</span>
                </span>
              </div>
              <span className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${clickedLocation.status_badge}`}>
                {clickedLocation.status_category}
              </span>
            </div>
          </div>

          {/* Scenario Toggles for Clicked Location */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">{t.prediction.scenarioLabel}:</span>
              <button
                onClick={() => handleScenarioChange('normal')}
                className={`px-3 py-1 rounded-lg border font-medium ${
                  scenario === 'normal' ? 'bg-teal-500 text-white border-teal-400' : 'bg-[#0B192C] text-gray-300 border-[#244771]'
                }`}
              >
                {t.prediction.scenarioNormal}
              </button>
              <button
                onClick={() => handleScenarioChange('low_rainfall')}
                className={`px-3 py-1 rounded-lg border font-medium ${
                  scenario === 'low_rainfall' ? 'bg-amber-500 text-white border-amber-400' : 'bg-[#0B192C] text-gray-300 border-[#244771]'
                }`}
              >
                {t.prediction.scenarioLow}
              </button>
              <button
                onClick={() => handleScenarioChange('high_rainfall')}
                className={`px-3 py-1 rounded-lg border font-medium ${
                  scenario === 'high_rainfall' ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-[#0B192C] text-gray-300 border-[#244771]'
                }`}
              >
                {t.prediction.scenarioHigh}
              </button>
            </div>

            <span className="text-gray-400 text-[11px]">
              Methodology: {clickedLocation.confidence}
            </span>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && <LoadingState message="Computing 6-month groundwater trajectory for selected coordinate..." />}

      {/* 6-Month Prediction Cards */}
      {locationPrediction && !loading && (
        <PredictionCard
          prediction={locationPrediction}
          currentLang={currentLang}
          t={t}
        />
      )}
    </div>
  );
}
