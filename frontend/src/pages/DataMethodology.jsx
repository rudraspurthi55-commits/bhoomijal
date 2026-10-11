import React, { useEffect, useState } from 'react';
import { fetchModelMetrics, fetchDataSources } from '../services/api';

export default function DataMethodology({ t }) {
  const [modelMetrics, setModelMetrics] = useState(null);
  const [sources, setSources] = useState([]);

  useEffect(() => {
    fetchModelMetrics().then(setModelMetrics).catch(console.error);
    fetchDataSources().then(setSources).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-wider text-teal-400 font-bold">
          Scientific Transparency & Integrity
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
          {t.nav.methodology}: How Bhoomijal Estimates Aquifers
        </h2>
        <p className="text-sm text-gray-300 mt-2 leading-relaxed">
          Groundwater dynamics are governed by rainfall percolation, subsurface lithology, hydraulic conductivity, and agricultural extraction. Bhoomijal pairs empirical observations with recursive machine learning models.
        </p>
      </div>

      {/* Honest Limitations & Disclaimers */}
      <div className="bg-[#132A44] border border-amber-500/30 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
          <span>⚠️</span> Important Hydrogeological Disclaimers
        </h3>
        <div className="mt-3 space-y-2 text-xs text-gray-300 leading-relaxed">
          <p>
            • <strong>Predictions are mathematical estimates, not guarantees:</strong> Groundwater fluctuates based on unmeasured local extraction, undocumented borewells, and fractured rock anomalies.
          </p>
          <p>
            • <strong>No Physical Remote Penetration:</strong> Bhoomijal does <em>not</em> claim to physically scan underground rock or measure exact volumetric groundwater storage in real-time.
          </p>
          <p>
            • <strong>Proactive Water Planning:</strong> The tool is designed to help farmers anticipate multi-month drying trends and take preventative soil moisture conservation measures.
          </p>
        </div>
      </div>

      {/* Active Model Performance Card */}
      {modelMetrics && (
        <div className="bg-[#132A44] border border-[#244771] rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1E3E62]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🤖</span> Machine Learning Model Performance
              </h3>
              <p className="text-xs text-gray-400">
                Algorithm: {modelMetrics.algorithm || "Random Forest Regressor"}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold">
              Status: {modelMetrics.status?.toUpperCase() || "ACTIVE"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-[#0B192C] p-3.5 rounded-xl border border-[#1E3E62]">
              <span className="text-[10px] text-gray-400 uppercase block">RMSE (Test Split)</span>
              <span className="text-xl font-black text-teal-400">{modelMetrics.metrics?.rmse}m</span>
            </div>
            <div className="bg-[#0B192C] p-3.5 rounded-xl border border-[#1E3E62]">
              <span className="text-[10px] text-gray-400 uppercase block">MAE</span>
              <span className="text-xl font-black text-cyan-400">{modelMetrics.metrics?.mae}m</span>
            </div>
            <div className="bg-[#0B192C] p-3.5 rounded-xl border border-[#1E3E62]">
              <span className="text-[10px] text-gray-400 uppercase block">R² Coefficient</span>
              <span className="text-xl font-black text-emerald-400">{modelMetrics.metrics?.r2_score}</span>
            </div>
            <div className="bg-[#0B192C] p-3.5 rounded-xl border border-[#1E3E62]">
              <span className="text-[10px] text-gray-400 uppercase block">Sample Count</span>
              <span className="text-xl font-black text-white">{modelMetrics.total_samples || 432}</span>
            </div>
          </div>

          {/* Feature Importances */}
          {modelMetrics.feature_importances && (
            <div className="mt-6 pt-4 border-t border-[#1E3E62]">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
                Feature Influence Weights in Aquifer Estimation
              </h4>
              <div className="space-y-2">
                {Object.entries(modelMetrics.feature_importances).slice(0, 5).map(([feat, val]) => (
                  <div key={feat} className="text-xs">
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span className="font-mono text-teal-300">{feat}</span>
                      <span>{(val * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0B192C] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full" style={{ width: `${val * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Lineage & Authority Sources */}
      <div className="bg-[#132A44] border border-[#244771] rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <span>📡</span> Ingested Environmental Data Sources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sources.map((src) => (
            <div key={src.id} className="bg-[#0E2034] border border-[#1E3E62] rounded-xl p-4 text-xs">
              <strong className="text-teal-300 block text-sm font-bold">{src.name}</strong>
              <span className="text-gray-400 block mt-1">{src.type}</span>
              <div className="mt-3 pt-2 border-t border-[#1E3E62]/60 text-gray-400 space-y-1">
                <div>Cadence: <span className="text-gray-200">{src.cadence}</span></div>
                <div>Status: <span className="text-amber-300 font-medium">{src.status}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
