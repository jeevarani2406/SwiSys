'use client';

import React, { useState, useEffect } from 'react';
import { j1939Service } from '../services/j1939Service';

/**
 * SPNMappingTable Component
 * 
 * Displays PGN to SPN mapping with all details including:
 * - PGN (Hex and Decimal)
 * - SPN Number
 * - Description
 * - Bit Range
 * - Length (bits)
 * - Unit
 * 
 * Shows "No SPN Data Available" for PGNs without mappings
 */
const SPNMappingTable = ({ pgnList = [], onClose, title = "PGN to SPN Mapping" }) => {
  const [mappingData, setMappingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'PGN_DEC', direction: 'asc' });

  useEffect(() => {
    if (pgnList && pgnList.length > 0) {
      fetchMapping();
    }
  }, [pgnList]);

  const fetchMapping = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await j1939Service.mapPGNsToSPNs(pgnList);
      setMappingData(response);
    } catch (err) {
      console.error('Error fetching SPN mapping:', err);
      setError(err.message || 'Failed to fetch SPN mapping');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = mappingData?.data?.filter(pgn => {
    const searchLower = searchTerm.toLowerCase();
    const matchesPGN = pgn.PGN_DEC.toString().includes(searchLower) || 
                       pgn.PGN_HEX.toLowerCase().includes(searchLower);
    const matchesSPN = pgn.SPNs?.some(spn => 
      spn.SPN.toString().includes(searchLower) ||
      spn.Description.toLowerCase().includes(searchLower)
    );
    return matchesPGN || matchesSPN;
  }) || [];

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortConfig.key === 'PGN_DEC') {
      return sortConfig.direction === 'asc' ? a.PGN_DEC - b.PGN_DEC : b.PGN_DEC - a.PGN_DEC;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Loading SPN Mapping...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center text-red-600">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold">Error Loading Data</h3>
          <p className="mt-2">{error}</p>
          <button 
            onClick={fetchMapping}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {mappingData && (
              <p className="text-blue-100 text-sm mt-1">
                Total Unique SPNs: <span className="font-bold text-white">{mappingData.total_unique_spn_count}</span> | 
                PGNs with Data: <span className="font-bold text-white">{mappingData.pgns_with_spn_data}</span> | 
                PGNs without Data: <span className="font-bold text-yellow-200">{mappingData.pgns_without_spn_data}</span>
              </p>
            )}
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
          placeholder="Search by PGN, SPN, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Summary Stats */}
      {mappingData && (
        <div className="px-6 py-3 bg-blue-50 border-b flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">{mappingData.total_unique_spn_count}</span>
            <span className="text-sm text-gray-600">Unique SPNs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">{mappingData.total_pgn_count}</span>
            <span className="text-sm text-gray-600">Total PGNs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-indigo-600">{mappingData.pgns_with_spn_data}</span>
            <span className="text-sm text-gray-600">With SPN Data</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-yellow-600">{mappingData.pgns_without_spn_data}</span>
            <span className="text-sm text-gray-600">No SPN Data</span>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="max-h-[60vh] overflow-y-auto">
        {sortedData.map((pgn, index) => (
          <div key={`${pgn.PGN_DEC}-${index}`} className="border-b last:border-b-0">
            {/* PGN Header */}
            <div className="bg-gray-100 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-mono text-lg bg-blue-100 text-blue-800 px-3 py-1 rounded-lg border border-blue-200">
                  {pgn.PGN_HEX}
                </span>
                <span className="font-mono text-lg bg-gray-200 text-gray-700 px-3 py-1 rounded-lg border border-gray-300">
                  {pgn.PGN_DEC}
                </span>
                <span className="text-sm text-gray-500">
                  {pgn.SPNs?.length || 0} SPN(s)
                </span>
              </div>
              {pgn.message && (
                <span className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                  ⚠️ {pgn.message}
                </span>
              )}
            </div>

            {/* SPN Table */}
            {pgn.SPNs && pgn.SPNs.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PGN (Hex)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PGN (Dec)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SPN
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Physical Value
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bit Range
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pgn.SPNs.map((spn, spnIndex) => (
                    <tr key={`${spn.SPN}-${spnIndex}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {pgn.PGN_HEX}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {pgn.PGN_DEC}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {spn.SPN}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                        {spn.Description}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                          {spn.Resolution && spn.Offset !== undefined 
                            ? `${spn.Resolution} × raw + ${spn.Offset}` 
                            : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {spn.Unit || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded">
                          {spn.Bit_Range}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-8 text-center">
                <div className="flex flex-col items-center text-gray-400">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium">No SPN Data Available</p>
                  <p className="text-sm">This PGN doesn't have any SPN parameters in the database</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Showing {sortedData.length} of {mappingData?.data?.length || 0} PGNs
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
};

export default SPNMappingTable;
