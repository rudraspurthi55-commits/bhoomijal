import React from 'react';

export default function GroundwaterChart({ historical = [], predictions = [], stationName = "Monitoring Station" }) {
  // Combine historical and prediction points
  const combined = [
    ...historical.slice(-12).map((h, i) => ({
      date: h.observation_date ? h.observation_date.slice(0, 7) : `H-${i}`,
      depth: h.depth_to_water_level_m,
      type: 'historical'
    })),
    ...predictions.map((p, i) => ({
      date: p.month_name ? p.month_name.slice(0, 8) : `M+${i + 1}`,
      depth: p.predicted_depth_m,
      lower: p.lower_bound_m,
      upper: p.upper_bound_m,
      type: 'predicted'
    }))
  ];

  if (combined.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        Select a monitoring well or click the map to view historical and predicted hydrograph.
      </div>
    );
  }

  // Calculate scales
  const allDepths = combined.map(d => d.depth);
  const minDepth = Math.max(0, Math.floor(Math.min(...allDepths) - 2));
  const maxDepth = Math.ceil(Math.max(...allDepths) + 4);
  const range = maxDepth - minDepth || 10;

  const width = 700;
  const height = 260;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Inverted Y: In groundwater, deeper depth (higher meters bgl) is lower on the chart!
  const getX = (index) => paddingLeft + (index / (combined.length - 1 || 1)) * plotWidth;
  const getY = (val) => paddingTop + ((val - minDepth) / range) * plotHeight;

  // Generate path
  let pathD = '';
  let predPathD = '';
  let predStartIndex = -1;

  combined.forEach((pt, idx) => {
    const x = getX(idx);
    const y = getY(pt.depth);
    if (pt.type === 'historical') {
      if (idx === 0) pathD += `M ${x} ${y}`;
      else pathD += ` L ${x} ${y}`;
    } else {
      if (predStartIndex === -1) {
        predStartIndex = idx;
        const prevPt = combined[idx - 1] || pt;
        predPathD += `M ${getX(idx - 1)} ${getY(prevPt.depth)} L ${x} ${y}`;
      } else {
        predPathD += ` L ${x} ${y}`;
      }
    }
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-teal-400 inline-block"></span>
            <span className="text-gray-300">Historical Observation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 border-b border-dashed inline-block"></span>
            <span className="text-cyan-300 font-medium">6-Month AI Prediction</span>
          </div>
        </div>
        <span className="text-gray-400 text-[11px]">
          Axis inverted: Deeper depth = Deeper water table (m bgl)
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 bg-[#0E2034] rounded-xl border border-[#1E3E62]">
        {/* Horizontal Threshold guide lines */}
        {[8, 15, 25].map(thresh => {
          if (thresh >= minDepth && thresh <= maxDepth) {
            const y = getY(thresh);
            const label = thresh === 8 ? 'Safe Limit (<8m)' : thresh === 15 ? 'Moderate Limit (15m)' : 'Critical Stress (25m)';
            const color = thresh === 8 ? '#10B981' : thresh === 15 ? '#F59E0B' : '#EF4444';
            return (
              <g key={thresh}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke={color} strokeDasharray="4 4" strokeOpacity="0.4" />
                <text x={width - paddingRight - 5} y={y - 4} fill={color} fontSize="9" textAnchor="end" fillOpacity="0.8">
                  {label}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* Y Axis Labels */}
        {[minDepth, Math.round((minDepth + maxDepth) / 2), maxDepth].map(val => (
          <text key={val} x={paddingLeft - 8} y={getY(val) + 3} fill="#94A3B8" fontSize="10" textAnchor="end">
            {val}m
          </text>
        ))}

        {/* Historical Line */}
        {pathD && <path d={pathD} fill="none" stroke="#00ADB5" strokeWidth="2.5" />}

        {/* Prediction Line */}
        {predPathD && (
          <path d={predPathD} fill="none" stroke="#00E5FF" strokeWidth="2.5" strokeDasharray="5 3" />
        )}

        {/* Data points */}
        {combined.map((pt, idx) => (
          <g key={idx}>
            <circle
              cx={getX(idx)}
              cy={getY(pt.depth)}
              r={pt.type === 'predicted' ? 4 : 3.5}
              fill={pt.type === 'predicted' ? '#00E5FF' : '#00ADB5'}
              stroke="#0B192C"
              strokeWidth="1.5"
            />
            {idx % 2 === 0 && (
              <text x={getX(idx)} y={height - 12} fill="#64748B" fontSize="9" textAnchor="middle">
                {pt.date}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
