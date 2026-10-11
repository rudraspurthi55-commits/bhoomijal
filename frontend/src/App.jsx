import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import GroundwaterMapPage from './pages/GroundwaterMapPage';
import PredictionLab from './pages/PredictionLab';
import StoryMode from './pages/StoryMode';
import DataMethodology from './pages/DataMethodology';
import AdminDataManager from './pages/AdminDataManager';

import en from './locales/en.json';
import te from './locales/te.json';
import hi from './locales/hi.json';

import { fetchLocations, fetchLocationDetails, fetchStationPredictions, fetchDataStatus } from './services/api';

const locales = { en, te, hi };

export default function App() {
  const [currentLang, setCurrentLang] = useState('en');
  const [activePage, setActivePage] = useState('home');
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [dataStatus, setDataStatus] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const t = locales[currentLang] || locales.en;

  // Initial Data Load
  const loadData = async () => {
    try {
      const [stnList, status] = await Promise.all([
        fetchLocations(),
        fetchDataStatus()
      ]);
      setStations(stnList);
      setDataStatus(status);

      if (stnList.length > 0) {
        // Load details for first station (Medak Central Aquifer)
        const first = stnList[0];
        const details = await fetchLocationDetails(first.station_id);
        setSelectedStation(details);

        // Preload initial 6-month forecast
        const pred = await fetchStationPredictions(first.station_id, 'normal');
        setPrediction(pred);
      }
    } catch (err) {
      console.error("Initialization error:", err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectStation = async (stn) => {
    try {
      const details = await fetchLocationDetails(stn.station_id);
      setSelectedStation(details);
      const pred = await fetchStationPredictions(stn.station_id, 'normal');
      setPrediction(pred);
    } catch (err) {
      console.error("Failed selecting station:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B192C] text-[#E0E6ED] flex flex-col font-sans">
      {/* Top Navbar with 3-language selector */}
      <Navbar
        currentLang={currentLang}
        setLang={setCurrentLang}
        t={t}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activePage === 'home' && (
          <Home
            stations={stations}
            onSelectStation={handleSelectStation}
            setActivePage={setActivePage}
            t={t}
          />
        )}

        {activePage === 'dashboard' && (
          <Dashboard
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
            prediction={prediction}
            dataStatus={dataStatus}
            t={t}
          />
        )}

        {activePage === 'map' && (
          <GroundwaterMapPage
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
            currentLang={currentLang}
            t={t}
          />
        )}

        {activePage === 'predictionLab' && (
          <PredictionLab
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
            prediction={prediction}
            setPrediction={setPrediction}
            currentLang={currentLang}
            t={t}
          />
        )}

        {activePage === 'storyMode' && (
          <StoryMode
            setActivePage={setActivePage}
            t={t}
          />
        )}

        {activePage === 'methodology' && (
          <DataMethodology
            t={t}
          />
        )}

        {activePage === 'admin' && (
          <AdminDataManager
            dataStatus={dataStatus}
            onRefreshStatus={loadData}
            t={t}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#081220] border-t border-[#1E3E62] py-8 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>
              <strong>Bhoomijal (భూమిజల్ / भूमिजल)</strong> — AI Groundwater Intelligence & Seasonal Prediction
            </span>
          </div>
          <div className="text-gray-400 text-center sm:text-right">
            <span>Estimates based on CGWB schema & hydrogeological dynamics. Proactive farmer guidance prototype.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
