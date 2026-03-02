'use client';

import { useState, useMemo, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import { CapacityMarker, mockCapacityData } from '@/lib/mock-capacity-data';
import { Transition } from '@headlessui/react';
import { X, Mail, Phone, Plus, Zap } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface HoveredMarker {
  marker: CapacityMarker;
  x: number;
  y: number;
}

type FilterType = 'all' | 'seller' | 'buyer';
type FilterVoltage = 'all' | '11kV' | '33kV' | '132kV';

// Match calculation
function calculateMatchScore(listing: CapacityMarker, candidate: CapacityMarker): number {
  let score = 0;
  
  // Voltage match (most important)
  if (listing.voltage === candidate.voltage) {
    score += 60;
  }
  
  // Capacity compatibility
  const capacityDiff = Math.abs(listing.capacity_mw - candidate.capacity_mw);
  if (capacityDiff <= 2) score += 30;
  else if (capacityDiff <= 5) score += 20;
  else if (capacityDiff <= 10) score += 10;
  
  // Distance bonus (simplified - same owner = close)
  if (listing.owner === candidate.owner) {
    score += 10;
  }
  
  return Math.min(score, 100);
}

export default function CapacityMap() {
  const [hoveredMarker, setHoveredMarker] = useState<HoveredMarker | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<CapacityMarker | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  
  // Filters
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterVoltage, setFilterVoltage] = useState<FilterVoltage>('all');
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [maxCapacity, setMaxCapacity] = useState<number>(25);

  // Local storage for user-submitted listings
  const [userListings, setUserListings] = useState<CapacityMarker[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    locationName: '',
    capacity: '',
    voltage: '33kV' as '11kV' | '33kV' | '132kV',
    email: '',
    description: ''
  });

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Load user listings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('userCapacityListings');
    if (stored) {
      try {
        setUserListings(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored listings:', e);
      }
    }
  }, []);

  // Combined data
  const allMarkers = useMemo(() => {
    return [...mockCapacityData, ...userListings];
  }, [userListings]);

  // Filter the markers based on current filters
  const filteredMarkers = useMemo(() => {
    return allMarkers.filter((marker) => {
      const typeMatch = filterType === 'all' || marker.type === filterType;
      const voltageMatch = filterVoltage === 'all' || marker.voltage === filterVoltage;
      const capacityMatch = marker.capacity_mw >= minCapacity && marker.capacity_mw <= maxCapacity;
      
      return typeMatch && voltageMatch && capacityMatch;
    });
  }, [allMarkers, filterType, filterVoltage, minCapacity, maxCapacity]);

  // Calculate matches for selected marker
  const matches = useMemo(() => {
    if (!selectedMarker) return [];
    
    const oppositeType = selectedMarker.type === 'seller' ? 'buyer' : 'seller';
    const candidates = allMarkers.filter(m => m.type === oppositeType && m.id !== selectedMarker.id);
    
    return candidates
      .map(candidate => ({
        marker: candidate,
        score: calculateMatchScore(selectedMarker, candidate)
      }))
      .filter(m => m.score >= 50) // Only show decent matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 matches
  }, [selectedMarker, allMarkers]);

  // Quick win check
  const isQuickWin = (marker: CapacityMarker) => marker.voltage === '132kV';

  const handleSubmitListing = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newListing: CapacityMarker = {
      id: `user-${Date.now()}`,
      lat: 51.5 + (Math.random() - 0.5) * 5, // Random UK location
      lng: -1.5 + (Math.random() - 0.5) * 4,
      type: 'seller',
      capacity_mw: parseFloat(formData.capacity),
      voltage: formData.voltage,
      location_name: formData.locationName,
      owner: formData.email
    };
    
    const updated = [...userListings, newListing];
    setUserListings(updated);
    localStorage.setItem('userCapacityListings', JSON.stringify(updated));
    
    // Reset form and close modal
    setFormData({
      locationName: '',
      capacity: '',
      voltage: '33kV',
      email: '',
      description: ''
    });
    setShowListModal(false);
    
    // Auto-select the new marker
    setSelectedMarker(newListing);
  };

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
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">E-Grid Capacity Marketplace</h1>
            <p className="text-sm text-gray-400">Connect buyers and sellers of grid capacity</p>
          </div>
          <button
            onClick={() => setShowListModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            <Plus className="w-5 h-5" />
            List Your Capacity
          </button>
        </div>
      </div>

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
        
        {filteredMarkers.map((marker) => (
          <Marker
            key={marker.id}
            longitude={marker.lng}
            latitude={marker.lat}
            anchor="center"
          >
            <div
              className="relative cursor-pointer group"
              onClick={() => setSelectedMarker(marker)}
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
              {/* Quick Win Badge */}
              {isQuickWin(marker) && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg flex items-center gap-1 z-10">
                  <Zap className="w-3 h-3" />
                  Quick Win
                </div>
              )}
              
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

      {/* Filter Panel */}
      <div className="absolute top-24 left-8 bg-slate-800/95 backdrop-blur-sm text-white px-6 py-5 rounded-lg shadow-xl border border-slate-700 max-w-md">
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-gray-300">Filter Capacity</h3>
        
        <div className="space-y-4">
          {/* Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Type</label>
            <div className="flex gap-2">
              {(['all', 'seller', 'buyer'] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    filterType === type
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Voltage Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Voltage</label>
            <div className="grid grid-cols-4 gap-2">
              {(['all', '11kV', '33kV', '132kV'] as FilterVoltage[]).map((voltage) => (
                <button
                  key={voltage}
                  onClick={() => setFilterVoltage(voltage)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    filterVoltage === voltage
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {voltage === 'all' ? 'All' : voltage}
                </button>
              ))}
            </div>
          </div>

          {/* Capacity Range */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Capacity Range: {minCapacity} - {maxCapacity} MW
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={minCapacity}
                onChange={(e) => setMinCapacity(Number(e.target.value))}
                min={0}
                max={maxCapacity}
                className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min"
              />
              <div className="flex-1 h-px bg-slate-600" />
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                min={minCapacity}
                max={50}
                className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="pt-2 border-t border-slate-700">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-blue-400">{filteredMarkers.length}</span> of {allMarkers.length} listings
            </p>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredMarker && !selectedMarker && (
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
              {isQuickWin(hoveredMarker.marker) && (
                <div className="flex items-center gap-1 text-green-400 font-semibold mt-2">
                  <Zap className="w-3 h-3" />
                  Quick Win
                </div>
              )}
            </div>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-800" />
        </div>
      )}

      {/* Sidebar */}
      <Transition
        show={!!selectedMarker}
        enter="transition-transform duration-300 ease-out"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transition-transform duration-200 ease-in"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
        <div className="fixed right-0 top-0 h-full w-96 bg-slate-900/98 backdrop-blur-sm border-l border-slate-700 shadow-2xl z-50 overflow-y-auto">
          {selectedMarker && (
            <div className="p-6">
              {/* Close Button */}
              <button
                onClick={() => setSelectedMarker(null)}
                className="absolute top-6 right-6 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Type Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  selectedMarker.type === 'seller'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    selectedMarker.type === 'seller' ? 'bg-blue-500' : 'bg-amber-500'
                  }`} />
                  {selectedMarker.type.toUpperCase()}
                </div>

                {isQuickWin(selectedMarker) && (
                  <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                    <Zap className="w-3 h-3" />
                    Quick Win
                  </div>
                )}
              </div>

              {/* Location Name */}
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedMarker.location_name}
              </h2>

              {/* Owner */}
              <p className="text-gray-400 text-sm mb-6">{selectedMarker.owner}</p>

              {/* Capacity Details */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Capacity Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Capacity</span>
                    <span className="text-white font-semibold text-lg">
                      {selectedMarker.capacity_mw} MW
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Voltage Level</span>
                    <span className="text-white font-medium">{selectedMarker.voltage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Location ID</span>
                    <span className="text-gray-300 font-mono text-xs">{selectedMarker.id}</span>
                  </div>
                </div>
              </div>

              {/* Match Suggestions */}
              {matches.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    {selectedMarker.type === 'seller' ? 'Potential Buyers' : 'Available Capacity'}
                  </h3>
                  <div className="space-y-3">
                    {matches.map(({ marker: match, score }) => (
                      <div 
                        key={match.id}
                        onClick={() => setSelectedMarker(match)}
                        className="bg-slate-700/50 rounded-lg p-3 border border-slate-600 hover:border-blue-500 cursor-pointer transition-all hover:bg-slate-700"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold text-sm">{match.location_name}</h4>
                            <p className="text-gray-400 text-xs">{match.owner}</p>
                          </div>
                          <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/30">
                            {score}% match
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-300">
                          <span>{match.capacity_mw} MW</span>
                          <span>•</span>
                          <span>{match.voltage}</span>
                          {isQuickWin(match) && (
                            <>
                              <span>•</span>
                              <span className="text-green-400 font-semibold flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Quick Win
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 mb-3">
                Express Interest
              </button>

              {/* Contact Options */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium py-2.5 px-4 rounded-lg transition-colors border border-slate-700">
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium py-2.5 px-4 rounded-lg transition-colors border border-slate-700">
                  <Phone className="w-4 h-4" />
                  Call
                </button>
              </div>

              {/* Additional Info */}
              <div className="pt-6 border-t border-slate-700">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  About this listing
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {selectedMarker.type === 'seller' 
                    ? 'This operator has available capacity and is looking to connect buyers to their network.'
                    : 'This operator is seeking additional capacity to meet growing demand in this area.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </Transition>

      {/* List Capacity Modal */}
      <Transition
        show={showListModal}
        enter="transition-opacity duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Transition
            show={showListModal}
            enter="transition-all duration-300 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition-all duration-200 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">List Your Capacity</h2>
                <button
                  onClick={() => setShowListModal(false)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitListing} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Oxford Substation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Capacity (MW) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    min="0"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="15.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Voltage Level *
                  </label>
                  <select
                    required
                    value={formData.voltage}
                    onChange={(e) => setFormData({ ...formData, voltage: e.target.value as '11kV' | '33kV' | '132kV' })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="11kV">11kV</option>
                    <option value="33kV">33kV</option>
                    <option value="132kV">132kV (Quick Win)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Additional details about your capacity..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                >
                  Submit Listing
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Your listing will appear on the map immediately
              </p>
            </div>
          </Transition>
        </div>
      </Transition>

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
          <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-sm">Quick Win (132kV)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
