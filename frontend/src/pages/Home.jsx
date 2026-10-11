import React, { useState } from 'react';

export default function Home({ stations = [], onSelectStation, setActivePage, t }) {
  const [selectedStationId, setSelectedStationId] = useState('');

  const handleQuickSelect = (e) => {
    const id = e.target.value;
    setSelectedStationId(id);
    const found = stations.find(s => s.station_id === id);
    if (found) {
      onSelectStation(found);
      setActivePage('predictionLab');
    }
  };

  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#132A44] via-[#0E2034] to-[#0B192C] border border-[#244771] p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
            {t.hero.badge}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {t.hero.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-gray-300 leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActivePage('map')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-teal-500/25 hover:from-teal-400 hover:to-cyan-400 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              📍 {t.hero.exploreMap}
            </button>
            <button
              onClick={() => setActivePage('predictionLab')}
              className="px-6 py-3 rounded-xl bg-[#1E3E62] text-teal-300 border border-teal-500/30 font-bold text-sm hover:bg-[#244771] transition-all"
            >
              📈 {t.hero.viewPredictions}
            </button>
            <button
              onClick={() => setActivePage('storyMode')}
              className="px-6 py-3 rounded-xl bg-[#0B192C]/80 text-gray-300 border border-[#244771] font-semibold text-sm hover:text-white hover:bg-[#132A44] transition-all"
            >
              🌾 {t.hero.raviStory}
            </button>
          </div>

          {/* Quick Station Jump */}
          <div className="mt-8 pt-6 border-t border-[#1E3E62]/60 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
              Quick Aquifer Lookup:
            </span>
            <select
              value={selectedStationId}
              onChange={handleQuickSelect}
              className="bg-[#0B192C] border border-[#244771] text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400 max-w-sm"
            >
              <option value="">-- Choose a Monitoring Well --</option>
              {stations.map(s => (
                <option key={s.station_id} value={s.station_id}>
                  {s.station_name} ({s.district}, {s.state}) - {s.latest_depth_m}m bgl
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#132A44] border border-[#244771] rounded-2xl p-6 hover:border-teal-500/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-2xl mb-4">
            ⏱️
          </div>
          <h3 className="text-lg font-bold text-white">6-Month Early Warning</h3>
          <p className="mt-2 text-xs text-gray-300 leading-relaxed">
            Instead of discovering an empty borewell mid-summer, get 6 months advance notice to adjust crop choices and rainwater storage.
          </p>
        </div>

        <div className="bg-[#132A44] border border-[#244771] rounded-2xl p-6 hover:border-teal-500/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-2xl mb-4">
            🎯
          </div>
          <h3 className="text-lg font-bold text-white">Click-Anywhere Map</h3>
          <p className="mt-2 text-xs text-gray-300 leading-relaxed">
            Spatial Haversine interpolation allows users to click anywhere on the country grid to estimate aquifer depth instantly.
          </p>
        </div>

        <div className="bg-[#132A44] border border-[#244771] rounded-2xl p-6 hover:border-teal-500/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl mb-4">
            🗣️
          </div>
          <h3 className="text-lg font-bold text-white">3-Language Farmer Guidance</h3>
          <p className="mt-2 text-xs text-gray-300 leading-relaxed">
            Designed for grassroots farmers with full dynamic localization in English, Telugu (తెలుగు), and Hindi (हिंदी).
          </p>
        </div>
      </div>
    </div>
  );
}
