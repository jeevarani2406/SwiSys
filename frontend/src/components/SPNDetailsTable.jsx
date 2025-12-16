'use client';

import React, { useState } from 'react';

/**
 * SPNDetailsTable Component
 * 
 * Displays a detailed table of all SPN values with:
 * - SPN Number
 * - Description
 * - Physical Value (from Resolution/Offset calculation)
 * - Units
 * - Bit Range
 * 
 * @param {Object} props
 * @param {Array} props.spnDetails - Array of SPN detail objects from j1939_spn_details
 * @param {string} props.title - Optional title for the table
 * @param {Function} props.onClose - Optional close handler for modal mode
 */
export default function SPNDetailsTable({ spnDetails = [], title = "SPN Details", onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'spn', direction: 'asc' });

  // Filter SPNs based on search term
  const filteredSpns = spnDetails.filter(spn => {
    const searchLower = searchTerm.toLowerCase();
    return (
      spn.spn?.toString().includes(searchLower) ||
      spn.description?.toLowerCase().includes(searchLower) ||
      spn.unit?.toLowerCase().includes(searchLower) ||
      spn.pgn?.toString().includes(searchLower) ||
      spn.pgn_hex?.toLowerCase().includes(searchLower)
    );
  });

  // Sort SPNs
  const sortedSpns = [...filteredSpns].sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    
    switch (sortConfig.key) {
      case 'spn':
        return (a.spn - b.spn) * direction;
      case 'pgn':
        return (a.pgn - b.pgn) * direction;
      case 'description':
        return (a.description || '').localeCompare(b.description || '') * direction;
      case 'unit':
        return (a.unit || '').localeCompare(b.unit || '') * direction;
      default:
        return 0;
    }
  });

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
    return <span className="text-blue-600 ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  // Calculate physical value from resolution and offset
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

  if (!spnDetails || spnDetails.length === 0) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-8">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">No SPN Data Available</p>
          <p className="text-sm mt-1">Upload a J1939 file to see SPN details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="text-green-100 text-sm mt-1">
              Total SPNs: <span className="font-bold text-white">{spnDetails.length}</span> | 
              Showing: <span className="font-bold text-white">{sortedSpns.length}</span>
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <input
          type="text"
          placeholder="Search by SPN, PGN, description, or unit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Table */}
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('spn')}
              >
                SPN <SortIcon column="spn" />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('description')}
              >
                Description <SortIcon column="description" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Physical Value
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('unit')}
              >
                Units <SortIcon column="unit" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bit Range
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('pgn')}
              >
                PGN (Hex) <SortIcon column="pgn" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PGN (Dec)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSpns.map((spn, index) => (
              <tr key={`${spn.spn}-${index}`} className="hover:bg-green-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-green-100 text-green-800">
                    {spn.spn}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900 max-w-md" title={spn.description}>
                    {spn.description || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {getPhysicalValue(spn)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {spn.unit || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-mono text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded">
                    {getBitRange(spn)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-mono text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                    {spn.pgn_hex || `0x${spn.pgn?.toString(16).toUpperCase()}`}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {spn.pgn}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Showing {sortedSpns.length} of {spnDetails.length} SPNs
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
