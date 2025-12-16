'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { j1939Service, API_BASE } from '../../services/j1939Service';
import VehicleSummaryTable from '../VehicleSummaryTable';
import VehicleSPNOverview from '../VehicleSPNOverview';
import SPNSearch from '../SPNSearch';
import SPNMappingTable from '../SPNMappingTable';

// dynamic import wrapper for xlsx
let XLSX = null;
const loadXLSX = async () => {
  if (!XLSX) {
    XLSX = await import('xlsx').then((mod) => mod.default || mod);
  }
  return XLSX;
};

// Helper function to convert PGN value to hex and decimal formats
const convertPgnValue = (pgnValue) => {
  if (!pgnValue && pgnValue !== 0) return { hex: 'N/A', decimal: 'N/A', original: pgnValue };
  
  try {
    const strValue = String(pgnValue).trim();
    let hexValue = '';
    let decimalValue = '';
    
    // Check if it's already in hex format (starts with 0x or contains letters A-F)
    if (strValue.toLowerCase().startsWith('0x') || /[a-f]/i.test(strValue)) {
      // Remove 0x prefix if present
      const cleanHex = strValue.replace(/^0x/i, '');
      // Convert hex to decimal
      const decInt = parseInt(cleanHex, 16);
      if (!isNaN(decInt)) {
        hexValue = `0x${cleanHex.toUpperCase()}`;
        decimalValue = decInt.toString();
      } else {
        hexValue = strValue;
        decimalValue = strValue;
      }
    } 
    // Check if it's a decimal number
    else if (/^\d+$/.test(strValue)) {
      const decInt = parseInt(strValue, 10);
      if (!isNaN(decInt)) {
        decimalValue = decInt.toString();
        hexValue = `0x${decInt.toString(16).toUpperCase()}`;
      } else {
        decimalValue = strValue;
        hexValue = strValue;
      }
    }
    // If it's neither, return original
    else {
      hexValue = strValue;
      decimalValue = strValue;
    }
    
    return {
      hex: hexValue,
      decimal: decimalValue,
      original: strValue
    };
  } catch (error) {
    console.error('Error converting PGN value:', pgnValue, error);
    return {
      hex: String(pgnValue),
      decimal: String(pgnValue),
      original: String(pgnValue)
    };
  }
};

// PGN Overview Modal Component
const VehiclePGNOverview = ({ open, pgns, vehicleName, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'decimal', direction: 'asc' });
  const [pgnList, setPgnList] = useState([]);

  useEffect(() => {
    if (pgns) {
      const formattedPgns = pgns.map(pgn => {
        const converted = convertPgnValue(pgn.value || pgn.pgn || pgn);
        return {
          ...pgn,
          pgn_hex: converted.hex,
          pgn_decimal: converted.decimal,
          original_value: converted.original
        };
      });
      setPgnList(formattedPgns);
    }
  }, [pgns]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredPgns = pgnList.filter(pgn => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (pgn.pgn_hex && pgn.pgn_hex.toLowerCase().includes(searchLower)) ||
      (pgn.pgn_decimal && pgn.pgn_decimal.toString().toLowerCase().includes(searchLower)) ||
      (pgn.description && pgn.description.toLowerCase().includes(searchLower)) ||
      (pgn.original_value && pgn.original_value.toString().toLowerCase().includes(searchLower))
    );
  });

  const sortedPgns = [...filteredPgns].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    // For numeric sorting of decimal values
    if (sortConfig.key === 'pgn_decimal' && !isNaN(parseInt(aVal)) && !isNaN(parseInt(bVal))) {
      const aNum = parseInt(aVal);
      const bNum = parseInt(bVal);
      return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
    }
    
    // For hex sorting, convert to decimal first
    if (sortConfig.key === 'pgn_hex') {
      const aDec = parseInt(a.pgn_decimal) || 0;
      const bDec = parseInt(b.pgn_decimal) || 0;
      return sortConfig.direction === 'asc' ? aDec - bDec : bDec - aDec;
    }
    
    // For string sorting
    if (aVal < bVal) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aVal > bVal) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {vehicleName ? `PGNs for ${vehicleName}` : 'All PGNs Overview'}
            </h3>
            <p className="text-sm text-gray-600">
              {filteredPgns.length} PGNs found • Showing both hexadecimal and decimal formats
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search PGNs by hex, decimal, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredPgns.length} of {pgnList.length} PGNs
            </div>
          </div>
        </div>

        {/* PGN Table */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('pgn_hex')}
                >
                  <div className="flex items-center gap-1">
                    PGN (Hexadecimal)
                    {sortConfig.key === 'pgn_hex' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('pgn_decimal')}
                >
                  <div className="flex items-center gap-1">
                    PGN (Decimal)
                    {sortConfig.key === 'pgn_decimal' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Associated SPNs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occurrences
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPgns.length > 0 ? (
                sortedPgns.map((pgn, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                          {pgn.pgn_hex || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded border border-gray-200">
                        {pgn.pgn_decimal || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {pgn.description || 'No description available'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {pgn.spns && Array.isArray(pgn.spns) && pgn.spns.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {pgn.spns.slice(0, 3).map((spn, idx) => (
                            <span key={idx} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              SPN {spn}
                            </span>
                          ))}
                          {pgn.spns.length > 3 && (
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                              +{pgn.spns.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No SPNs</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {pgn.count || pgn.occurrences || 1}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No PGNs found</p>
                      <p className="text-sm mt-1">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">Format Legend:</span>
                <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Hexadecimal (0xXXXX)</span>
                <span className="font-mono text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded">Decimal</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CustomerDashboard() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();

  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [summaryData, setSummaryData] = useState([]);
  const [totalSpnCount, setTotalSpnCount] = useState(0);
  const [totalPgnCount, setTotalPgnCount] = useState(0);
  const [uniquePgnCount, setUniquePgnCount] = useState(0);
  const [analysisTotals, setAnalysisTotals] = useState(null);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  
  const [pgnModalOpen, setPgnModalOpen] = useState(false);
  const [allPgns, setAllPgns] = useState([]);
  const [pgnModalTitle, setPgnModalTitle] = useState('');

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    phone: ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  // SPN Mapping Modal State
  const [spnMappingModalOpen, setSpnMappingModalOpen] = useState(false);
  const [spnMappingPgnList, setSpnMappingPgnList] = useState([]);
  const [spnMappingTitle, setSpnMappingTitle] = useState('PGN to SPN Mapping');
  const [uniqueSpnFromMapping, setUniqueSpnFromMapping] = useState(0);

  const fileInputRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  const pushNotification = (type, message) => {
    setNotifications((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), type, message },
    ]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((note) => note.id !== id));
  };

  useEffect(() => {
    if (!user || user.role !== 'customer') router.push('/login');
    
    const timer = setTimeout(() => {
      if (notifications.length > 0) {
        setNotifications((prev) => prev.slice(1));
      }
    }, 5000); 

    return () => clearTimeout(timer);
  }, [user, router, notifications.length]);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        company: user.company || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const countPgnsFromData = (vehicleData) => {
    if (!vehicleData) return { total: 0, unique: 0 };
    
    let totalPgns = 0;
    let uniquePgns = new Set();
    
    if (vehicleData.pgns && Array.isArray(vehicleData.pgns)) {
      totalPgns = vehicleData.pgns.length;
      vehicleData.pgns.forEach(pgn => {
        if (pgn && pgn.value) uniquePgns.add(pgn.value);
      });
    }
    
    return {
      total: totalPgns,
      unique: uniquePgns.size
    };
  };

  // Function to open PGN modal for all vehicles
  const openAllPgnsModal = () => {
    const allPgnsList = [];
    const uniquePgnMap = new Map();
    
    summaryData.forEach(vehicle => {
      if (vehicle.pgns && Array.isArray(vehicle.pgns)) {
        vehicle.pgns.forEach(pgn => {
          const pgnKey = pgn.value || pgn.pgn || JSON.stringify(pgn);
          
          if (uniquePgnMap.has(pgnKey)) {
            const existing = uniquePgnMap.get(pgnKey);
            existing.count = (existing.count || 1) + 1;
            existing.vehicles.push(vehicle.vehicle);
          } else {
            uniquePgnMap.set(pgnKey, {
              ...pgn,
              count: pgn.count || 1,
              vehicles: [vehicle.vehicle]
            });
          }
        });
      }
    });
    
    setAllPgns(Array.from(uniquePgnMap.values()));
    setPgnModalTitle(`All PGNs (${uniquePgnMap.size} unique across all vehicles)`);
    setPgnModalOpen(true);
  };

  // Function to open PGN modal for specific vehicle
  const openVehiclePgnsModal = (vehicle) => {
    if (vehicle && vehicle.pgns) {
      setAllPgns(vehicle.pgns);
      setPgnModalTitle(`PGNs for ${vehicle.vehicle || vehicle.name}`);
      setPgnModalOpen(true);
    }
  };

  // Function to open SPN Mapping modal with all PGNs from uploaded data
  const openSPNMappingModal = () => {
    const allPgnDecimalValues = new Set();
    
    summaryData.forEach(vehicle => {
      if (vehicle.pgns && Array.isArray(vehicle.pgns)) {
        vehicle.pgns.forEach(pgn => {
          const pgnValue = pgn.value || pgn.pgn_decimal || pgn.pgn;
          if (pgnValue) {
            // Convert to decimal if it's a hex string
            let decimalValue = pgnValue;
            if (typeof pgnValue === 'string') {
              if (pgnValue.toLowerCase().startsWith('0x')) {
                decimalValue = parseInt(pgnValue, 16);
              } else {
                decimalValue = parseInt(pgnValue, 10);
              }
            }
            if (!isNaN(decimalValue)) {
              allPgnDecimalValues.add(decimalValue);
            }
          }
        });
      }
    });
    
    const pgnList = Array.from(allPgnDecimalValues).sort((a, b) => a - b);
    setSpnMappingPgnList(pgnList);
    setSpnMappingTitle(`PGN to SPN Mapping (${pgnList.length} PGNs from uploaded files)`);
    setSpnMappingModalOpen(true);
  };

  // Function to open SPN Mapping for a specific vehicle
  const openVehicleSPNMapping = (vehicle) => {
    if (vehicle && vehicle.pgns) {
      const pgnDecimalValues = new Set();
      
      vehicle.pgns.forEach(pgn => {
        const pgnValue = pgn.value || pgn.pgn_decimal || pgn.pgn;
        if (pgnValue) {
          let decimalValue = pgnValue;
          if (typeof pgnValue === 'string') {
            if (pgnValue.toLowerCase().startsWith('0x')) {
              decimalValue = parseInt(pgnValue, 16);
            } else {
              decimalValue = parseInt(pgnValue, 10);
            }
          }
          if (!isNaN(decimalValue)) {
            pgnDecimalValues.add(decimalValue);
          }
        }
      });
      
      const pgnList = Array.from(pgnDecimalValues).sort((a, b) => a - b);
      setSpnMappingPgnList(pgnList);
      setSpnMappingTitle(`SPN Mapping for ${vehicle.vehicle || vehicle.name}`);
      setSpnMappingModalOpen(true);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      pushNotification('error', '❌ Please select files to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const resp = await j1939Service.uploadFiles(files, (pct) => setUploadProgress(pct));

      const vehicles = resp.vehicles || [];
      const errors = resp.errors || [];
      const totals = resp.totals || {};

      let allPgns = new Set();
      let totalPgnsAllFiles = 0;
      
      vehicles.forEach(vehicle => {
        const pgnCounts = countPgnsFromData(vehicle);
        totalPgnsAllFiles += pgnCounts.total;
        
        if (vehicle.pgns && Array.isArray(vehicle.pgns)) {
          vehicle.pgns.forEach(pgn => {
            if (pgn && pgn.value) allPgns.add(pgn.value);
          });
        }
      });

      setTotalPgnCount(totalPgnsAllFiles);
      setUniquePgnCount(allPgns.size);
      // Calculate total SPNs - use j1939_unique_spn_count from totals or sum from vehicles
      const totalSpns = totals.j1939_unique_spn_count || totals.total_spn_count || 
        vehicles.reduce((sum, v) => sum + (v.j1939_unique_spn_count || v.j1939_spn_details?.length || 0), 0);
      setTotalSpnCount(totalSpns);
      setAnalysisTotals(totals);

      if (vehicles.length > 0) {
        pushNotification('success', `✔ Analysis completed • Vehicles: ${vehicles.length} • SPNs: ${totalSpns} • Total PGNs: ${totalPgnsAllFiles} • Unique PGNs: ${allPgns.size}`);
        
        if (totals.j1939_unique_spn_count) {
          pushNotification('info', `📊 Unique J1939 SPNs across all files: ${totals.j1939_unique_spn_count}`);
        }
        if (totals.unique_pgn_count) {
          pushNotification('info', `📊 Unique PGNs across all files: ${totals.unique_pgn_count}`);
        }
      }

      if (errors.length > 0) {
        errors.forEach((err) => {
          pushNotification('error', `❌ ${err.filename || 'File'}: ${err.error || 'Unknown error'}`);
        });
      }

      setSummaryData(vehicles.map((v) => {
        const pgnCounts = countPgnsFromData(v);
        return {
          id: v.id,
          vehicle: v.name,
          name: v.name,
          brand: v.brand || 'Unknown',
          filename: v.filename,
          source_file: v.source_file,
          pgnCount: pgnCounts.total,
          uniquePgnCount: pgnCounts.unique,
          spnCount: v.spnCount,
          // J1939 Standard SPN data - pass through from backend
          j1939_unique_spn_count: v.j1939_unique_spn_count || 0,
          j1939_spn_list: v.j1939_spn_list || [],
          j1939_spn_details: v.j1939_spn_details || [],
          // PGN stats from backend
          total_pgn_messages: v.total_pgn_messages || pgnCounts.total,
          unique_pgn_count: v.unique_pgn_count || pgnCounts.unique,
          unique_pgn_list: v.unique_pgn_list || [],
          upload_date: v.upload_date,
          spns: v.spns || [],
          pgns: v.pgns || [],
          pgnSpnMapping: v.pgnSpnMapping || {},
          analysis_summary: {
            ...(v.analysis_summary || {}),
            pgn_count: pgnCounts.total,
            unique_pgn_count: pgnCounts.unique
          }
        };
      }));

      setUploadProgress(100);

    } catch (err) {
      console.error('Upload failed:', err);
      const errorMessage = err instanceof Error ? err.message : (err && err.message) ? err.message : 'Server error';
      pushNotification('error', `❌ Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const exportCSV = () => {
    if (!summaryData.length) {
      pushNotification('info', 'No data to export.');
      return;
    }

    const rows = [
      ['Vehicle Name', 'Brand', 'Source File', 'Total PGNs', 'Unique PGNs', 'SPNs', 'Upload Date'],
      ...summaryData.map((r) => [
        r.vehicle,
        r.brand,
        r.filename,
        r.pgnCount,
        r.uniquePgnCount || r.analysis_summary?.unique_pgn_count || 'N/A',
        r.spnCount,
        r.upload_date || ''
      ])
    ];

    if (analysisTotals || totalPgnCount > 0) {
      rows.push(['', '', '', '', '', '', '']);
      rows.push(['TOTALS', '', '', totalPgnCount, uniquePgnCount || analysisTotals?.unique_pgns_across_all || '', 
                 totalSpnCount || analysisTotals?.total_spn_count || '', '']);
    }

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "j1939_analysis_detailed_pgns.csv";
    a.click();
    pushNotification('success', 'CSV export started.');
  };

  const exportExcel = async () => {
    if (!summaryData.length) {
      pushNotification('info', 'No data to export.');
      return;
    }

    try {
      const XLSX = await loadXLSX();

      const summaryWs = XLSX.utils.aoa_to_sheet([
        ['J1939 Analysis Summary with PGN Counts', '', '', '', '', '', ''],
        ['Generated', new Date().toLocaleString(), '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['Vehicle Name', 'Brand', 'Source File', 'Total PGNs', 'Unique PGNs', 'SPNs', 'Upload Date'],
        ...summaryData.map((r) => [
          r.vehicle,
          r.brand,
          r.filename,
          r.pgnCount,
          r.uniquePgnCount || r.analysis_summary?.unique_pgn_count || 'N/A',
          r.spnCount,
          r.upload_date || ''
        ])
      ]);

      // Enhanced PGN listing sheet with both hex and decimal
      const pgnList = [];
      summaryData.forEach(vehicle => {
        if (vehicle.pgns && Array.isArray(vehicle.pgns)) {
          vehicle.pgns.forEach(pgn => {
            const converted = convertPgnValue(pgn.value || pgn.pgn || pgn);
            pgnList.push([
              vehicle.vehicle,
              converted.hex,
              converted.decimal,
              pgn.description || '',
              pgn.count || 1
            ]);
          });
        }
      });

      const pgnWs = XLSX.utils.aoa_to_sheet([
        ['All PGNs from Analysis', '', '', '', ''],
        ['Vehicle', 'PGN (Hexadecimal)', 'PGN (Decimal)', 'Description', 'Occurrences'],
        ...pgnList
      ]);

      const totalsData = analysisTotals ? [
        ['PGN Analysis Totals', ''],
        ['Total Vehicles', summaryData.length],
        ['Total SPN Count', analysisTotals.total_spn_count],
        ['Total PGN Count (all files)', totalPgnCount],
        ['Unique PGNs Across All Files', analysisTotals.unique_pgns_across_all || uniquePgnCount || 0],
        ['Unique SPNs Across All Files', analysisTotals.unique_spns_across_all || 0],
        ['', ''],
        ['PGN Details by Vehicle', ''],
        ...summaryData.map(v => [`${v.vehicle} (${v.brand})`, `Total PGNs: ${v.pgnCount}, Unique: ${v.uniquePgnCount || v.analysis_summary?.unique_pgn_count || 0}`])
      ] : [['No PGN analysis available', '']];

      const totalsWs = XLSX.utils.aoa_to_sheet(totalsData);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      XLSX.utils.book_append_sheet(wb, totalsWs, 'Totals');
      if (pgnList.length > 0) {
        XLSX.utils.book_append_sheet(wb, pgnWs, 'All PGNs (Hex+Dec)');
      }

      const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = "j1939_analysis_with_pgns_hex_dec.xlsx";
      a.click();
      pushNotification('success', 'Excel export started.');
      
    } catch (e) {
      console.error('Excel export failed:', e);
      pushNotification('error', '❌ Excel export failed. Please try again.');
    }
  };

  const exportPDF = () => {
    if (!summaryData.length) {
      pushNotification('info', 'No data to export.');
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("J1939 Analysis Summary with PGN Counts", 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);
    
    doc.autoTable({
      head: [['Vehicle', 'Brand', 'File', 'Total PGNs', 'Unique PGNs', 'SPNs']],
      body: summaryData.map((r) => [
        r.vehicle, 
        r.brand, 
        r.filename, 
        r.pgnCount, 
        r.uniquePgnCount || r.analysis_summary?.unique_pgn_count || 'N/A', 
        r.spnCount
      ]),
      startY: 30,
      theme: 'grid'
    });
    
    const finalY = doc.lastAutoTable.finalY || 50;
    doc.setFontSize(12);
    doc.text("PGN Analysis Totals", 14, finalY + 10);
    
    if (analysisTotals) {
      const totals = [
        ['Total Vehicles:', summaryData.length],
        ['Total SPN Count:', analysisTotals.total_spn_count],
        ['Total PGN Count (all files):', totalPgnCount],
        ['Unique PGNs Across All:', analysisTotals.unique_pgns_across_all || uniquePgnCount || 0],
        ['Unique SPNs Across All:', analysisTotals.unique_spns_across_all || 0]
      ];
      
      doc.autoTable({
        body: totals,
        startY: finalY + 15,
        theme: 'plain'
      });
    }
    
    doc.save("j1939_analysis_with_pgns.pdf");
    pushNotification('success', 'PDF export started.');
  };

  const openVehicleModal = (row) => {
    if (!row) return;
    setSelectedVehicle(row);
    setVehicleModalOpen(true);
  };

  const openProfileModal = () => {
    setProfileModalOpen(true);
    setIsEditing(false);
    setProfileSuccess('');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess('');

    try {
      const updated = await updateProfile(profileData);
      if (updated) {
        setProfileSuccess('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : (error && error.message) ? error.message : 'Unknown error';
      pushNotification('error', `❌ Failed to update profile: ${errorMessage}`);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onFilesAdded = (incomingFiles) => {
    const allowedExt = ['csv', 'txt', 'log'];
    const existing = [...files];
    const toAdd = [];

    Array.from(incomingFiles).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !allowedExt.includes(ext)) {
        pushNotification('error', '❌ Only J1939 data files (.csv, .txt, .log) are allowed');
        return;
      }
      const duplicate = existing.some(
        (ex) => ex.name === file.name && ex.size === file.size
      );
      if (duplicate || toAdd.some((ex) => ex.name === file.name && ex.size === file.size)) {
        pushNotification('error', '❌ This file has already been added');
        return;
      }
      toAdd.push(file);
    });

    if (toAdd.length) {
      setFiles((prev) => [...prev, ...toAdd]);
      pushNotification('success', `✔ ${toAdd.length} file(s) added for analysis`);
    }
  };

  const handleFileChange = (e) => onFilesAdded(e.target.files);
  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); onFilesAdded(e.dataTransfer.files); };
  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false); };

  const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));
  const clearAllFiles = () => { setFiles([]); };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">J1939 Analytics Dashboard</h1>
            <p className="text-gray-600 text-sm">Welcome, {user?.first_name || user?.username}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={() => {
                    logout();
                    router.push('/login');
                }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
                Logout
            </button>
            <button 
                onClick={openProfileModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Profile</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Upload Section */}
        <section>
          <div className="bg-white shadow-sm rounded-xl p-6 border">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Upload J1939 Data Files</h2>
            <p className="text-gray-500 text-sm mb-4">
              Upload J1939 data files (.csv, .txt, .log) for SPN and PGN analysis. Multiple files allowed.
            </p>

            {notifications.length > 0 && (
              <div className="mb-4 space-y-2">
                {notifications.map((note) => {
                  const base =
                    note.type === 'success'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : note.type === 'error'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700';
                  return (
                    <div
                      key={note.id}
                      className={`flex justify-between items-center border px-3 py-2 rounded ${base}`}
                    >
                      <span className="text-sm">{note.message}</span>
                      <button
                        onClick={() => removeNotification(note.id)}
                        className="text-xs font-semibold hover:opacity-70"
                        aria-label="Dismiss notification"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex items-center gap-6 p-4 rounded-lg border-2 ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex-1">
                <label className="flex flex-col items-center justify-center h-36 cursor-pointer">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600">Drag & drop J1939 files here</p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                    <p className="text-xs text-gray-400">All file types supported (CSV, XLSX, XLS, TXT, LOG, etc.)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <div className="w-80 flex flex-col gap-3">
                <div className="bg-white rounded-lg p-3 h-36 overflow-y-auto border">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-gray-400 uppercase">
                      Selected Files ({files.length})
                    </h3>
                    {files.length > 0 && (
                      <button onClick={clearAllFiles} className="text-red-500 text-xs hover:underline">
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="mt-2">
                    {files.length > 0 ? (
                      <ul className="space-y-2">
                        {files.map((file, idx) => (
                          <li key={idx} className="flex justify-between items-center bg-white p-2 rounded border">
                            <span className="text-sm text-gray-700 truncate w-40">{file.name}</span>
                            <button
                              onClick={() => removeFile(idx)}
                              className="text-red-500 hover:text-red-700 text-lg leading-none"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400 mt-3">No files selected</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={files.length === 0 || isUploading}
                  className={`w-full py-3 rounded-lg text-white font-medium ${
                    files.length === 0 || isUploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? `Processing... ${uploadProgress}%` : 'Analyze Files'}
                </button>
              </div>
            </div>

            {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1 text-center">{uploadProgress}% complete</p>
              </div>
            )}

            <div className="mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                The system will analyze J1939 data, count all PGN values, and map SPNs to their respective PGNs according to SAE J1939 standards.
              </div>
            </div>
          </div>
        </section>

        {/* Analysis Summary Section */}
        <section>
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">2. Analysis Summary</h2>
              {analysisTotals && (
                <p className="text-sm text-gray-600">
                  Total analysis across {summaryData.length} vehicle(s)
                </p>
              )}
            </div>
            
            {summaryData.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-4 bg-gray-50 px-4 py-2 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalSpnCount}</div>
                    <div className="text-xs text-gray-600">Total SPNs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{totalPgnCount}</div>
                    <div className="text-xs text-gray-600">Total PGNs</div>
                    <div className="text-xs text-gray-400">(all files)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{uniquePgnCount || analysisTotals?.unique_pgns_across_all || 0}</div>
                    <div className="text-xs text-gray-600">Unique PGNs</div>
                    <div className="text-xs text-gray-400">(across all)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{summaryData.length}</div>
                    <div className="text-xs text-gray-600">Vehicles</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={exportCSV} 
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                  >
                    Export CSV
                  </button>
                  <button 
                    onClick={exportExcel} 
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                  >
                    Export Excel
                  </button>
                  <button 
                    onClick={exportPDF} 
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            )}
          </div>

          <VehicleSummaryTable
            vehicles={summaryData}
            isLoading={isUploading}
            onVehicleClick={openVehicleModal}
            showPgnDetails={true}
          />

        </section>

        {/* SPN Search Section */}
        <SPNSearch vehicles={summaryData} />
      </main>

      {/* Vehicle Details Modal */}
      <VehicleSPNOverview
        open={vehicleModalOpen}
        vehicle={selectedVehicle}
        onClose={() => {
          setVehicleModalOpen(false);
          setSelectedVehicle(null);
        }}
        onViewPgns={() => {
          if (selectedVehicle) {
            openVehiclePgnsModal(selectedVehicle);
            setVehicleModalOpen(false);
          }
        }}
      />

      {/* PGN Overview Modal */}
      <VehiclePGNOverview
        open={pgnModalOpen}
        pgns={allPgns}
        vehicleName={pgnModalTitle}
        onClose={() => {
          setPgnModalOpen(false);
          setAllPgns([]);
        }}
      />

      {/* Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={profileData.company}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                  {profileSuccess && (
                    <div className="mt-3 p-3 bg-green-50 text-green-700 text-sm rounded-md">
                      {profileSuccess}
                    </div>
                  )}
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      First Name
                    </label>
                    <p className="text-gray-900">{profileData.first_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Last Name
                    </label>
                    <p className="text-gray-900">{profileData.last_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{profileData.email || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Company
                    </label>
                    <p className="text-gray-900">{profileData.company || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900">{profileData.phone || 'Not set'}</p>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SPN Mapping Modal */}
      {spnMappingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-600 to-green-700 text-white">
              <div>
                <h3 className="text-xl font-semibold">{spnMappingTitle}</h3>
                <p className="text-green-100 text-sm mt-1">
                  Showing SPN definitions for {spnMappingPgnList.length} unique PGNs from uploaded files
                  {uniqueSpnFromMapping > 0 && (
                    <span className="ml-2 bg-green-500 px-2 py-1 rounded-full text-xs font-medium">
                      {uniqueSpnFromMapping} Total Unique SPNs
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSpnMappingModalOpen(false)}
                className="text-white hover:text-green-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <SPNMappingTable 
                pgnList={spnMappingPgnList} 
                onClose={() => setSpnMappingModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}