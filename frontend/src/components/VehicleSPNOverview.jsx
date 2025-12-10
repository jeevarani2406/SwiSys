// components/VehicleSPNOverview.jsx
'use client';

import React, { useState, useEffect } from 'react';

export default function VehicleSPNOverview({ open, vehicle, onClose }) {
  const [activeTab, setActiveTab] = useState('spns');
  const [expandedPGNs, setExpandedPGNs] = useState({});
  const [pgnList, setPgnList] = useState([]);
  const [spnCount, setSpnCount] = useState(0);
  const [pgnCount, setPgnCount] = useState(0);

  useEffect(() => {
    if (vehicle) {
      // Parse PGN-SPN mapping properly
      const mapping = parsePgnSpnMapping(vehicle);
      setPgnList(mapping.pgnList);
      setSpnCount(mapping.spnCount);
      setPgnCount(mapping.pgnCount);
    }
  }, [vehicle]);

  if (!open || !vehicle) return null;

  const togglePGN = (pgnHex) => {
    setExpandedPGNs(prev => ({
      ...prev,
      [pgnHex]: !prev[pgnHex]
    }));
  };

  // Parse PGN-SPN mapping from vehicle data
  const parsePgnSpnMapping = (vehicleData) => {
    let pgnList = [];
    let totalSpnCount = 0;
    
    // Method 1: Check for pgnSpnMapping property
    if (vehicleData.pgnSpnMapping && typeof vehicleData.pgnSpnMapping === 'object') {
      pgnList = Object.values(vehicleData.pgnSpnMapping);
      totalSpnCount = pgnList.reduce((sum, pgn) => sum + (pgn.spns?.length || 0), 0);
    }
    // Method 2: Check for pgns array with nested spns
    else if (vehicleData.pgns && Array.isArray(vehicleData.pgns)) {
      pgnList = vehicleData.pgns.map(pgn => ({
        pgn_hex: pgn.pgn_hex || pgn.pgn || '',
        pgn_dec: pgn.pgn_dec || pgn.pgn_id || 0,
        name: pgn.name || pgn.pgn_name || `PGN_${pgn.pgn_hex || ''}`,
        spn_count: pgn.spns?.length || 0,
        spns: pgn.spns || []
      }));
      totalSpnCount = pgnList.reduce((sum, pgn) => sum + (pgn.spns?.length || 0), 0);
    }
    // Method 3: If we have spns but no pgns, create a default mapping
    else if (vehicleData.spns && Array.isArray(vehicleData.spns)) {
      // Group SPNs by their PGN
      const groupedByPgn = {};
      vehicleData.spns.forEach(spn => {
        const pgnHex = spn.pgn_hex || 'UNKNOWN';
        if (!groupedByPgn[pgnHex]) {
          groupedByPgn[pgnHex] = {
            pgn_hex: pgnHex,
            pgn_dec: parseInt(pgnHex, 16) || 0,
            name: `PGN_${pgnHex}`,
            spn_count: 0,
            spns: []
          };
        }
        groupedByPgn[pgnHex].spns.push(spn);
        groupedByPgn[pgnHex].spn_count += 1;
      });
      pgnList = Object.values(groupedByPgn);
      totalSpnCount = vehicleData.spns.length;
    }
    
    return {
      pgnList,
      spnCount: totalSpnCount,
      pgnCount: pgnList.length
    };
  };

  // Get vehicle name safely
  const getVehicleName = () => {
    return vehicle.name || vehicle.vehicle || vehicle.filename?.split('.')[0] || 'Unknown Vehicle';
  };

  // Get brand safely
  const getVehicleBrand = () => {
    return vehicle.brand || 'Unknown';
  };

  // Get filename safely
  const getFilename = () => {
    return vehicle.source_file || vehicle.filename || 'No file';
  };

  // Get SPN count safely
  const getTotalSpnCount = () => {
    return spnCount || vehicle.spnCount || vehicle.spns?.length || 0;
  };

  // Get PGN count safely
  const getTotalPgnCount = () => {
    return pgnCount || vehicle.pgnCount || vehicle.pgns?.length || 0;
  };

  // Format bit range
  const formatBitRange = (spn) => {
    try {
      const start = parseInt(spn.start_bit) || 0;
      const width = parseInt(spn.bit_width) || 0;
      return `${start}-${start + width}`;
    } catch {
      return '0-0';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{getVehicleName()}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                PGNs: {getTotalPgnCount()}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                SPNs: {getTotalSpnCount()}
              </span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                File: {getFilename()}
              </span>
              {vehicle.brand && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  Brand: {getVehicleBrand()}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl p-1"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('spns')}
              className={`flex-shrink-0 px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'spns' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All SPNs ({getTotalSpnCount()})
            </button>
            <button
              onClick={() => setActiveTab('pgns')}
              className={`flex-shrink-0 px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'pgns' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              PGN-SPN Mapping ({pgnList.length})
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-shrink-0 px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'details' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Vehicle Details
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'spns' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">All SPNs (J1939 Standard)</h3>
                <span className="text-sm text-gray-500">
                  Showing {vehicle.spns?.length || 0} SPN parameters
                </span>
              </div>
              
              {vehicle.spns && vehicle.spns.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {vehicle.spns.map((spn, index) => {
                    const spnName = spn.name || spn.spn_name || `SPN_${index}`;
                    const spnValue = spn.value || spn.physical_value || 'N/A';
                    const spnDescription = spn.description || spn.parameter_name || 'No description';
                    const spnUnit = spn.unit || '';
                    const spnRawValue = spn.raw_value || 'N/A';
                    const spnStartBit = spn.start_bit || 0;
                    const spnBitWidth = spn.bit_width || 0;
                    const spnFactor = spn.factor || 1;
                    const spnOffset = spn.offset || 0;
                    
                    return (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{spnName}</h4>
                              {spn.pgn_hex && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  PGN: {spn.pgn_hex}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{spnDescription}</p>
                            
                            <div className="grid grid-cols-4 gap-3 mt-3 text-xs text-gray-500">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-700">Bit Range</span>
                                <span>{formatBitRange(spn)}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-700">Bits</span>
                                <span>{spnBitWidth}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-700">Factor</span>
                                <span>{spnFactor}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-700">Offset</span>
                                <span>{spnOffset}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right ml-4 min-w-[120px]">
                            <div className="text-lg font-semibold text-blue-600 mb-1">
                              {spnValue} {spnUnit}
                            </div>
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Raw: {spnRawValue}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No SPN Data Available</h3>
                  <p className="text-gray-500">This vehicle doesn't have any SPN parameters to display.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pgns' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-1">J1939 PGN-SPN Standard Mapping</h3>
                    <p className="text-sm text-blue-700">
                      This view shows SPNs organized by their respective Parameter Group Numbers (PGNs) 
                      according to SAE J1939 standards. Each PGN contains specific SPNs as defined in the 
                      SAE J1939 specification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {pgnList.length > 0 ? (
                  pgnList.map((pgn) => {
                    const pgnHex = pgn.pgn_hex || 'UNKNOWN';
                    const pgnName = pgn.name || `PGN_${pgnHex}`;
                    const pgnDec = pgn.pgn_dec || 0;
                    const spns = pgn.spns || [];
                    const spnCount = spns.length;
                    
                    return (
                      <div key={pgnHex} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                        {/* PGN Header */}
                        <button
                          onClick={() => togglePGN(pgnHex)}
                          className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                          aria-expanded={expandedPGNs[pgnHex] || false}
                        >
                          <div className="flex items-center gap-4 text-left">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-lg">
                              <span className="font-semibold">PGN</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{pgnName}</div>
                              <div className="text-sm text-gray-600">
                                Hex: {pgnHex} | Dec: {pgnDec}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              {spnCount} SPN{spnCount !== 1 ? 's' : ''}
                            </span>
                            <svg
                              className={`w-5 h-5 transform transition-transform ${expandedPGNs[pgnHex] ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {/* SPNs List */}
                        {expandedPGNs[pgnHex] && spnCount > 0 && (
                          <div className="p-4 border-t bg-gray-50">
                            <div className="space-y-3">
                              {spns.map((spn, index) => {
                                const spnName = spn.name || spn.spn_name || `SPN_${index}`;
                                const spnValue = spn.value || spn.physical_value || 'N/A';
                                const spnDescription = spn.description || spn.parameter_name || 'No description';
                                const spnUnit = spn.unit || '';
                                
                                return (
                                  <div key={index} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 mb-1">{spnName}</div>
                                      <div className="text-sm text-gray-600">{spnDescription}</div>
                                      {spn.start_bit !== undefined && spn.bit_width !== undefined && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          Bits: {formatBitRange(spn)}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="font-semibold text-blue-600 text-lg">
                                        {spnValue} {spnUnit}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {expandedPGNs[pgnHex] && spnCount === 0 && (
                          <div className="p-4 border-t bg-gray-50 text-center py-6">
                            <p className="text-gray-500">No SPNs associated with this PGN</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No PGN-SPN Mapping Available</h3>
                    <p className="text-gray-500 mb-4">This vehicle doesn't have PGN-SPN mapping data.</p>
                    <button
                      onClick={() => setActiveTab('spns')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View all SPNs instead →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Vehicle Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-white border rounded-lg p-5">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Vehicle Information</h4>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Vehicle Name</dt>
                        <dd className="text-sm font-medium text-gray-900">{getVehicleName()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Brand/Manufacturer</dt>
                        <dd className="text-sm font-medium text-gray-900">{getVehicleBrand()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Source File</dt>
                        <dd className="text-sm font-medium text-gray-900 break-all">{getFilename()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Upload Date</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {vehicle.upload_date ? new Date(vehicle.upload_date).toLocaleDateString() : 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="bg-white border rounded-lg p-5">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Data Analysis</h4>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Total PGNs</dt>
                        <dd className="text-sm font-medium text-gray-900">{getTotalPgnCount()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Total SPNs</dt>
                        <dd className="text-sm font-medium text-gray-900">{getTotalSpnCount()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">PGNs with SPNs</dt>
                        <dd className="text-sm font-medium text-gray-900">{pgnList.length}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-white border rounded-lg p-5">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">J1939 Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{getTotalPgnCount()}</div>
                        <div className="text-xs text-blue-800 uppercase tracking-wider mt-1">Parameter Groups</div>
                        <div className="text-xs text-gray-500 mt-1">(PGNs)</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{getTotalSpnCount()}</div>
                        <div className="text-xs text-green-800 uppercase tracking-wider mt-1">Signal Parameters</div>
                        <div className="text-xs text-gray-500 mt-1">(SPNs)</div>
                      </div>
                    </div>
                    
                    {vehicle.analysis_summary && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="text-xs font-medium text-gray-500 mb-2">Additional Metrics</h5>
                        <div className="space-y-2">
                          {vehicle.analysis_summary.unique_pgns && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Unique PGNs:</span>
                              <span className="font-medium">{vehicle.analysis_summary.unique_pgns}</span>
                            </div>
                          )}
                          {vehicle.analysis_summary.unique_spns && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Unique SPNs:</span>
                              <span className="font-medium">{vehicle.analysis_summary.unique_spns}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white border rounded-lg p-5">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">File Information</h4>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">File Format</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {getFilename().split('.').pop()?.toUpperCase() || 'CSV'}
                        </dd>
                      </div>
                      {vehicle.file_size && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">File Size</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {vehicle.file_size < 1024 
                              ? `${vehicle.file_size} bytes` 
                              : `${(vehicle.file_size / 1024).toFixed(2)} KB`}
                          </dd>
                        </div>
                      )}
                      {vehicle.analysis_time && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Analysis Time</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {vehicle.analysis_time}s
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Data Status</dt>
                        <dd className="text-sm font-medium text-green-600">
                          ✓ Analyzed Successfully
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t p-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Vehicle ID: {vehicle.id || 'N/A'} • SAE J1939 Standard
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                // You can add export functionality here
                console.log('Export vehicle data:', vehicle);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
            >
              Export Data
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}