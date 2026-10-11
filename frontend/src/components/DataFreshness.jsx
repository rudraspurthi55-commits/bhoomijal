import React from 'react';

export default function DataFreshness({ dataStatus, t }) {
  if (!dataStatus) return null;

  return (
    <div className="bg-[#102338] border border-[#1E3E62] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
        </span>
        <div>
          <span className="text-gray-300 font-medium">
            Active Data Mode: <strong className="text-white">{dataStatus.data_mode}</strong>
          </span>
          <p className="text-gray-400 text-[11px] mt-0.5">
            Latest Observation: <span className="text-teal-300">{dataStatus.latest_observation_date || 'Current'}</span> | Total Active Wells: <span className="text-teal-300">{dataStatus.total_monitoring_stations}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium text-[11px]">
          Simulated Prototype Reference
        </span>
        <span className="text-gray-400 text-[11px] hidden sm:inline">
          Refreshed via Ingestion Service
        </span>
      </div>
    </div>
  );
}
