'use client';

import React from 'react';

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
                PGNs Found
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                SPNs Found
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
              const pgnCount = Array.isArray(vehicle.pgns)
                ? vehicle.pgns.length
                : vehicle.pgnCount ?? 0;
              const totalSpns = Array.isArray(vehicle.spns)
                ? vehicle.spns.length
                : vehicle.spnCount ?? 0;
              const sourceFile = vehicle.source_file || vehicle.filename || 'N/A';

              return (
                <tr
                  key={vehicle.id || `${displayName}-${index}`}
                  className={`hover:bg-blue-50 transition-colors ${
                    onVehicleClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onVehicleClick && onVehicleClick(vehicle)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{displayName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{brand}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">{pgnCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">{totalSpns}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 truncate max-w-xs" title={sourceFile}>
                      {sourceFile}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

