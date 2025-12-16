'use client';

import React, { useState } from 'react';

/**
 * VehicleSummaryTable Component
 * 
 * Displays a table showing vehicle information after successful upload and analysis.
 * 
 * @param {Object} props
 * @param {Array} props.vehicles - Array of vehicle objects from the API response
 * @param {boolean} props.isLoading - Whether data is currently being loaded
 * @param {Function} props.onVehicleClick - Optional callback when a vehicle row is clicked
 */
export default function VehicleSummaryTable({ vehicles = [], isLoading = false, onVehicleClick }) {
  const [expandedVehicle, setExpandedVehicle] = useState(null);
  const [spnSearchTerm, setSpnSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'spn', direction: 'asc' });

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="bg-white shadow-sm rounded-xl border p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-sm">Analyzing files...</p>
        </div>
      </div>
    );
  }

  // Show empty state message
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-xl border p-12">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-2">No vehicle data found.</p>
          <p className="text-gray-500 text-sm">Please upload and analyze files.</p>
        </div>
      </div>
    );
  }

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return <span className="text-gray-300 ml-1">↕</span>;
    }
    return <span className="text-green-600 ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const toggleExpand = (vehicleId, e) => {
    e.stopPropagation();
    setExpandedVehicle(expandedVehicle === vehicleId ? null : vehicleId);
    setSpnSearchTerm('');
  };

  // Get filtered and sorted SPN details
  const getFilteredSpns = (spnDetails) => {
    if (!spnDetails) return [];
    
    const filtered = spnDetails.filter(spn => {
      const searchLower = spnSearchTerm.toLowerCase();
      return (
        spn.spn?.toString().includes(searchLower) ||
        spn.description?.toLowerCase().includes(searchLower) ||
        spn.unit?.toLowerCase().includes(searchLower) ||
        spn.pgn?.toString().includes(searchLower)
      );
    });

    return [...filtered].sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      switch (sortConfig.key) {
        case 'spn':
          return (a.spn - b.spn) * direction;
        case 'pgn':
          return (a.pgn - b.pgn) * direction;
        case 'description':
          return (a.description || '').localeCompare(b.description || '') * direction;
        default:
          return 0;
      }
    });
  };

  // Calculate physical value formula
  const getPhysicalValue = (spn) => {
    if (spn.resolution && spn.offset !== undefined) {
      return `${spn.resolution} × raw + ${spn.offset}`;
    }
    return '-';
  };

  // Format bit range
  const getBitRange = (spn) => {
    if (spn.start_byte !== undefined && spn.bit_length !== undefined) {
      const startBit = (spn.start_byte - 1) * 8 + (spn.start_bit || 0);
      const endBit = startBit + spn.bit_length - 1;
      return `${startBit}-${endBit}`;
    }
    return '-';
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total PGN Messages
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unique PGNs
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span className="text-green-600">Unique SPNs</span>
                <span className="block text-[10px] font-normal text-gray-400">(J1939 Standard)</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source File
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle, index) => {
              const displayName = vehicle.name || vehicle.vehicle || 'Unknown';
              const brand = vehicle.brand || '—';
              const totalPgnMessages = vehicle.total_pgn_messages ?? 0;
              const uniquePgnCount = vehicle.unique_pgn_count ?? (Array.isArray(vehicle.pgns) ? vehicle.pgns.length : vehicle.pgnCount ?? 0);
              const j1939SpnCount = vehicle.j1939_unique_spn_count ?? 0;
              const sourceFile = vehicle.source_file || vehicle.filename || 'N/A';
              const vehicleId = vehicle.id || `${displayName}-${index}`;
              const isExpanded = expandedVehicle === vehicleId;
              const spnDetails = vehicle.j1939_spn_details || [];
              const filteredSpns = getFilteredSpns(spnDetails);

              return (
                <React.Fragment key={vehicleId}>
                  <tr
                    className={`hover:bg-blue-50 transition-colors ${
                      onVehicleClick ? 'cursor-pointer' : ''
                    } ${isExpanded ? 'bg-green-50' : ''}`}
                    onClick={() => onVehicleClick && onVehicleClick(vehicle)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{displayName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{brand}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">{totalPgnMessages.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {uniquePgnCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={(e) => toggleExpand(vehicleId, e)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          j1939SpnCount > 0 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer' 
                            : 'bg-gray-100 text-gray-500'
                        }`}
                        disabled={j1939SpnCount === 0}
                      >
                        {j1939SpnCount}
                        {j1939SpnCount > 0 && (
                          <svg 
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 truncate max-w-xs" title={sourceFile}>
                        {sourceFile}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded SPN Details */}
                  {isExpanded && j1939SpnCount > 0 && (
                    <tr>
                      <td colSpan="6" className="px-0 py-0">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-t border-b border-green-200">
                          {/* SPN Details Header */}
                          <div className="px-6 py-3 bg-green-100 border-b border-green-200 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <h4 className="font-semibold text-green-800">
                                SPN Details - {j1939SpnCount} parameters found
                              </h4>
                              <input
                                type="text"
                                placeholder="Search SPNs..."
                                value={spnSearchTerm}
                                onChange={(e) => setSpnSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-1 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                              />
                            </div>
                            <span className="text-sm text-green-600">
                              Showing {filteredSpns.length} of {spnDetails.length}
                            </span>
                          </div>
                          
                          {/* SPN Details Table */}
                          <div className="max-h-96 overflow-y-auto">
                            <table className="min-w-full">
                              <thead className="bg-green-100 sticky top-0">
                                <tr>
                                  <th 
                                    className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer hover:bg-green-200"
                                    onClick={(e) => { e.stopPropagation(); handleSort('spn'); }}
                                  >
                                    SPN <SortIcon column="spn" />
                                  </th>
                                  <th 
                                    className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider cursor-pointer hover:bg-green-200"
                                    onClick={(e) => { e.stopPropagation(); handleSort('description'); }}
                                  >
                                    Description <SortIcon column="description" />
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                                    Physical Value
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                                    Units
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                                    Bit Range
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-green-100">
                                {filteredSpns.map((spn, spnIndex) => (
                                  <tr key={`${spn.spn}-${spnIndex}`} className="hover:bg-green-100/50">
                                    <td className="px-4 py-2 whitespace-nowrap">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-green-200 text-green-800">
                                        {spn.spn}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2">
                                      <div className="text-sm text-gray-900 max-w-md" title={spn.description}>
                                        {spn.description || '-'}
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                      <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                        {getPhysicalValue(spn)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                      <span className="text-sm text-gray-600">
                                        {spn.unit || '-'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                      <span className="font-mono text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded">
                                        {getBitRange(spn)}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

