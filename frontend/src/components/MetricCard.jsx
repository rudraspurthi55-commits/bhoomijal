import React from 'react';

export default function MetricCard({ title, value, unit, change, changeType, icon: Icon, badgeText, badgeColor = "teal" }) {
  const isPositive = changeType === 'good' || changeType === 'safe';
  const isWarning = changeType === 'warning' || changeType === 'moderate';
  const isDanger = changeType === 'bad' || changeType === 'critical';

  return (
    <div className="bg-[#132A44] border border-[#244771] rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-200 hover:border-teal-500/50 hover:shadow-teal-500/5">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {value}
            </span>
            {unit && <span className="text-xs text-gray-400 font-normal">{unit}</span>}
          </div>
        </div>
        <div className="p-3 bg-[#1E3E62]/60 rounded-xl border border-[#244771]/60 text-teal-400">
          {Icon}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        {change && (
          <span className={`font-semibold flex items-center gap-1 ${
            isDanger ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {change}
          </span>
        )}
        {badgeText && (
          <span className="px-2 py-0.5 rounded-full bg-[#1E3E62] text-gray-300 border border-[#244771]">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
