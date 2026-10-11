import React, { useEffect, useRef, useState } from 'react';

export default function GroundwaterMap({ stations = [], selectedStation, onSelectStation, onMapClickCoordinates, t }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const clickMarkerRef = useRef(null);
  const [filterState, setFilterState] = useState('All');

  const states = ['All', ...new Set(stations.map(s => s.state))];

  useEffect(() => {
    // Check if Leaflet L is available globally or load dynamically
    if (typeof window !== 'undefined' && window.L && mapContainerRef.current && !mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current).setView([17.5, 78.5], 6);

      // OpenStreetMap tiles (free, no API key needed)
      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Click anywhere on map handler
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (clickMarkerRef.current) {
          map.removeLayer(clickMarkerRef.current);
        }

        const pinIcon = window.L.divIcon({
          className: 'click-pin',
          html: `<div style="background-color:#00E5FF; width:16px; height:16px; border-radius:50%; border:2px solid #ffffff; box-shadow:0 0 10px #00E5FF;"></div>`,
          iconSize: [16, 16]
        });

        clickMarkerRef.current = window.L.marker([lat, lng], { icon: pinIcon })
          .addTo(map)
          .bindPopup(`<div style="padding:4px; font-size:12px; font-weight:bold;">📍 Clicked Location<br><span style="font-size:10px; color:#94A3B8;">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</span></div>`)
          .openPopup();

        if (onMapClickCoordinates) {
          onMapClickCoordinates(lat, lng);
        }
      });

      mapInstanceRef.current = map;
    }
  }, []);

  // Update markers when stations or filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const filtered = filterState === 'All' ? stations : stations.filter(s => s.state === filterState);

    filtered.forEach(stn => {
      const color = stn.latest_depth_m < 8 ? '#10B981' : stn.latest_depth_m < 15 ? '#F59E0B' : '#EF4444';

      const customIcon = window.L.divIcon({
        className: 'station-pin',
        html: `<div style="background-color:${color}; width:14px; height:14px; border-radius:50%; border:2px solid #ffffff; box-shadow:0 0 8px ${color};"></div>`,
        iconSize: [14, 14]
      });

      const marker = window.L.marker([stn.latitude, stn.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-size:12px; color:#E0E6ED; min-width:160px;">
            <strong style="color:#00ADB5;">${stn.station_name}</strong><br/>
            <span style="font-size:11px; color:#94A3B8;">${stn.district}, ${stn.state}</span><br/>
            <div style="margin-top:6px; padding:4px 6px; background:#0B192C; border-radius:4px; display:inline-block;">
              Depth: <strong>${stn.latest_depth_m}m bgl</strong>
            </div>
            <div style="margin-top:4px; font-size:10px; color:${color}; font-weight:bold;">
              ● ${stn.status_category}
            </div>
          </div>
        `);

      marker.on('click', () => {
        if (onSelectStation) onSelectStation(stn);
      });

      markersRef.current.push(marker);
    });
  }, [stations, filterState]);

  return (
    <div className="bg-[#132A44] border border-[#244771] rounded-2xl p-4 shadow-xl">
      {/* Map Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>🗺️</span> {t.mapSection.title}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {t.mapSection.instruction}
          </p>
        </div>

        {/* Filter State Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 whitespace-nowrap">{t.mapSection.filterState}:</label>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-[#0B192C] border border-[#244771] text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-500"
          >
            {states.map(s => (
              <option key={s} value={s}>{s === 'All' ? t.mapSection.allStates : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map View Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-80 sm:h-96 rounded-xl border border-[#1E3E62] overflow-hidden relative z-0"
      >
        {/* Fallback info when leaflet is initializing */}
        <noscript>JavaScript is required to render interactive map.</noscript>
      </div>

      {/* Map Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500"></span>
            Safe (&lt;8m)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500"></span>
            Moderate (8-15m)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500"></span>
            Critical (&gt;15m)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
            Clicked Location
          </span>
        </div>
        <span className="text-[11px] text-teal-400">
          Showing {filterState === 'All' ? stations.length : stations.filter(s => s.state === filterState).length} Monitoring Wells
        </span>
      </div>
    </div>
  );
}
s