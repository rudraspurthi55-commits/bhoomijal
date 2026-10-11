import React from 'react';

export default function PredictionCard({ prediction, currentLang = 'en', t }) {
  if (!prediction) return null;

  const { forecasts = [], baseline_depth_m, end_depth_m, total_change_m, is_depleting, overall_risk, disclaimer } = prediction;

  return (
    <div className="bg-[#132A44] border border-[#244771] rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1E3E62]">
        <div>
          <span className="text-xs uppercase tracking-wider text-teal-400 font-semibold">
            6-Month Forecast Overview
          </span>
          <h3 className="text-xl font-bold text-white mt-1">
            {prediction.station_name || "Custom Map Location"}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Baseline: <strong className="text-white">{baseline_depth_m}m bgl</strong> ➔ 6-Month Projected: <strong className="text-teal-300">{end_depth_m}m bgl</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-gray-400 block">Aquifer Trajectory</span>
            <span className={`text-sm font-bold ${is_depleting ? 'text-amber-400' : 'text-emerald-400'}`}>
              {is_depleting ? `▲ Depleting (+${total_change_m}m)` : `▼ Recharging (${total_change_m}m)`}
            </span>
          </div>
          <span className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${
            overall_risk === 'Safe' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
            overall_risk === 'Moderate' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
            'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}>
            {overall_risk}
          </span>
        </div>
      </div>

      {/* Month by month grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {forecasts.map((fc) => {
          const advisoryText = fc.advisory ? (fc.advisory[currentLang] || fc.advisory.en) : '';

          return (
            <div 
              key={fc.horizon_month}
              className="bg-[#0E2034] border border-[#1E3E62] rounded-xl p-4 flex flex-col justify-between hover:border-teal-500/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">
                    Month {fc.horizon_month} ({fc.month_name})
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    fc.status === 'Safe' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    fc.status === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {fc.status}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">
                    {fc.predicted_depth_m}
                  </span>
                  <span className="text-xs text-gray-400">m bgl</span>
                  <span className="text-[11px] text-gray-400 ml-auto">
                    [{fc.lower_bound_m}m - {fc.upper_bound_m}m]
                  </span>
                </div>

                {/* Farmer advice box */}
                <div className="mt-3 p-2.5 bg-[#132A44] rounded-lg border border-[#244771]/60 text-[11px] text-gray-300 leading-relaxed">
                  <span className="text-teal-400 font-medium block mb-0.5">🌾 Action Advice:</span>
                  {advisoryText}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#1E3E62]/60 flex items-center justify-between text-[10px] text-gray-400">
                <span>Target: {fc.target_date}</span>
                <span className={fc.depth_change_m > 0 ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
                  {fc.depth_change_m > 0 ? `+${fc.depth_change_m}m deeper` : `${fc.depth_change_m}m shallower`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transparent Disclaimer Box */}
      <div className="mt-6 p-3.5 bg-[#0B192C]/80 border border-teal-500/20 rounded-xl text-xs text-gray-400 flex items-start gap-2.5">
        <span className="text-teal-400 text-sm mt-0.5">ℹ️</span>
        <div>
          <strong className="text-gray-200">{t.prediction.disclaimerTitle}:</strong> {disclaimer || t.prediction.disclaimerText}
        </div>
      </div>
    </div>
  );
}
