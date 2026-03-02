'use client';

import { useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import { CapacityMarker, mockCapacityData } from '@/lib/mock-capacity-data';
import 'mapbox-gl/dist/mapbox-gl.css';

interface HoveredMarker {
  marker: CapacityMarker;
  x: number;
  y: number;
}

export default function CapacityMap() {
  const [hoveredMarker, setHoveredMarker] = useState<HoveredMarker | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Mapbox Token Required</h2>
          <p className="text-gray-400">Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file</p>
          <p className="text-sm text-gray-500 mt-2">Get your token at mapbox.com</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: -2.0,
          latitude: 54.0,
          zoom: 5.5
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >
        <NavigationControl position="top-right" />
        
        {mockCapacityData.map((marker) => (
          <Marker
            key={marker.id}
            longitude={marker.lng}
            latitude={marker.lat}
            anchor="center"
          >
            <div
              className="relative cursor-pointer group"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredMarker({
                  marker,
                  x: rect.left + rect.width / 2,
                  y: rect.top
                });
              }}
              onMouseLeave={() => setHoveredMarker(null)}
            >
              {/* Outer glow */}
              <div className={`absolute inset-0 rounded-full blur-md opacity-50 ${
                marker.type === 'seller' 
                  ? 'bg-blue-400' 
                  : 'bg-amber-400'
              }`} />
              
              {/* Inner marker */}
              <div className={`relative w-6 h-6 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-125 ${
                marker.type === 'seller'
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}>
                {/* Pulse animation */}
                <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                  marker.type === 'seller'
                    ? 'bg-blue-400'
                    : 'bg-amber-400'
                }`} />
              </div>
            </div>
          </Marker>
        ))}
      </Map>

      {/* Hover Tooltip */}
      {hoveredMarker && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: hoveredMarker.x,
            top: hoveredMarker.y - 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                hoveredMarker.marker.type === 'seller'
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`} />
              <span className="font-semibold text-sm uppercase tracking-wide">
                {hoveredMarker.marker.type}
              </span>
            </div>
            <h3 className="font-bold text-lg mb-1">{hoveredMarker.marker.location_name}</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p><span className="text-gray-400">Capacity:</span> <span className="font-semibold">{hoveredMarker.marker.capacity_mw} MW</span></p>
              <p><span className="text-gray-400">Voltage:</span> {hoveredMarker.marker.voltage}</p>
              <p className="text-xs text-gray-400 mt-2">{hoveredMarker.marker.owner}</p>
            </div>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-800" />
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-8 left-8 bg-slate-800/90 backdrop-blur-sm text-white px-5 py-4 rounded-lg shadow-xl border border-slate-700">
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Capacity Types</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md" />
            <span className="text-sm">Seller Offering</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-md" />
            <span className="text-sm">Buyer Seeking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
