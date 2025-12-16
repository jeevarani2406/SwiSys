'use client';

import { useState, useEffect, useRef } from 'react';
import { Users, Search, RefreshCw, CheckCircle, XCircle, Clock, Eye, FileText, BarChart3, Upload, Download, Trash2 } from 'lucide-react';
import apiClient from '../../../services/api';
import { j1939Service, API_BASE } from '../../../services/j1939Service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    
    if (strValue.toLowerCase().startsWith('0x') || /[a-f]/i.test(strValue)) {
      const cleanHex = strValue.replace(/^0x/i, '');
      const decInt = parseInt(cleanHex, 16);
      if (!isNaN(decInt)) {
        hexValue = `0x${cleanHex.toUpperCase()}`;
        decimalValue = decInt.toString();
      } else {
        hexValue = strValue;
        decimalValue = strValue;
      }
    } else if (/^\d+$/.test(strValue)) {
      const decInt = parseInt(strValue, 10);
      if (!isNaN(decInt)) {
        decimalValue = decInt.toString();
        hexValue = `0x${decInt.toString(16).toUpperCase()}`;
      } else {
        decimalValue = strValue;
        hexValue = strValue;
      }
    } else {
      hexValue = strValue;
      decimalValue = strValue;
    }
    
    return { hex: hexValue, decimal: decimalValue, original: strValue };
  } catch (error) {
    return { hex: String(pgnValue), decimal: String(pgnValue), original: String(pgnValue) };
  }
};

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // File upload state
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // Analysis data
  const [summaryData, setSummaryData] = useState([]);
  const [totalSpnCount, setTotalSpnCount] = useState(0);
  const [totalPgnCount, setTotalPgnCount] = useState(0);
  const [uniquePgnCount, setUniquePgnCount] = useState(0);
  const [analysisTotals, setAnalysisTotals] = useState(null);
  
  // Modal state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  
  // Notifications
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (notifications.length > 0) {
        setNotifications((prev) => prev.slice(1));
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [notifications.length]);

  const pushNotification = (type, message) => {
    setNotifications((prev) => [...prev, { id: Date.now() + Math.random(), type, message }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((note) => note.id !== id));
  };

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('accounts/admin/customers/');
      const data = response.data.results || response.data || [];
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError('Failed to load customers. Please try again.');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (statusFilter === 'approved' && !customer.is_approved) return false;
    if (statusFilter === 'pending' && customer.is_approved) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        customer.username?.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search) ||
        customer.full_name_english?.toLowerCase().includes(search) ||
        customer.company?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const totalCount = customers.length;
  const approvedCount = customers.filter(c => c.is_approved).length;
  const pendingCount = customers.filter(c => !c.is_approved).length;

  // File handling
  const onFilesAdded = (incomingFiles) => {
    const allowedExt = ['csv', 'txt', 'log', 'xlsx', 'xls'];
    const existing = [...files];
    const toAdd = [];

    Array.from(incomingFiles).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !allowedExt.includes(ext)) {
        pushNotification('error', `❌ Only J1939 data files (.csv, .txt, .log, .xlsx, .xls) are allowed`);
        return;
      }
      const duplicate = existing.some((ex) => ex.name === file.name && ex.size === file.size);
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
  const clearAllFiles = () => setFiles([]);

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
    return { total: totalPgns, unique: uniquePgns.size };
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
      const totalSpns = totals.j1939_unique_spn_count || totals.total_spn_count || 
        vehicles.reduce((sum, v) => sum + (v.j1939_unique_spn_count || v.j1939_spn_details?.length || 0), 0);
      setTotalSpnCount(totalSpns);
      setAnalysisTotals(totals);

      if (vehicles.length > 0) {
        pushNotification('success', `✔ Analysis completed • Vehicles: ${vehicles.length} • SPNs: ${totalSpns} • PGNs: ${totalPgnsAllFiles}`);
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
          j1939_unique_spn_count: v.j1939_unique_spn_count || 0,
          j1939_spn_list: v.j1939_spn_list || [],
          j1939_spn_details: v.j1939_spn_details || [],
          total_pgn_messages: v.total_pgn_messages || pgnCounts.total,
          unique_pgn_count: v.unique_pgn_count || pgnCounts.unique,
          upload_date: v.upload_date,
          spns: v.spns || [],
          pgns: v.pgns || [],
          pgnSpnMapping: v.pgnSpnMapping || {},
        };
      }));

      setUploadProgress(100);
      setFiles([]);
    } catch (err) {
      console.error('Upload failed:', err);
      pushNotification('error', `❌ Upload failed: ${err.message || 'Server error'}`);
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
      ['Vehicle Name', 'Brand', 'Source File', 'Total PGNs', 'Unique PGNs', 'SPNs'],
      ...summaryData.map((r) => [r.vehicle, r.brand, r.filename, r.pgnCount, r.uniquePgnCount, r.j1939_unique_spn_count])
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "j1939_analysis.csv";
    a.click();
    pushNotification('success', 'CSV export started.');
  };

  const exportPDF = () => {
    if (!summaryData.length) {
      pushNotification('info', 'No data to export.');
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("J1939 Analysis Summary", 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);
    doc.autoTable({
      head: [['Vehicle', 'Brand', 'File', 'Total PGNs', 'Unique PGNs', 'SPNs']],
      body: summaryData.map((r) => [r.vehicle, r.brand, r.filename, r.pgnCount, r.uniquePgnCount, r.j1939_unique_spn_count]),
      startY: 30,
      theme: 'grid'
    });
    doc.save("j1939_analysis.pdf");
    pushNotification('success', 'PDF export started.');
  };

  const openVehicleModal = (row) => {
    if (!row) return;
    setSelectedVehicle(row);
    setVehicleModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
            <Users className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Analysis Files</p>
              <p className="text-2xl font-bold text-gray-900">{summaryData.length}</p>
            </div>
            <BarChart3 className="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white shadow-sm rounded-xl p-6 border">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload J1939 Data Files</h2>
        <p className="text-gray-500 text-sm mb-4">
          Upload J1939 data files (.csv, .txt, .log, .xlsx) for SPN and PGN analysis
        </p>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-4 space-y-2">
            {notifications.map((note) => {
              const base = note.type === 'success' ? 'bg-green-50 border-green-200 text-green-800'
                : note.type === 'error' ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-blue-50 border-blue-200 text-blue-700';
              return (
                <div key={note.id} className={`flex justify-between items-center border px-3 py-2 rounded ${base}`}>
                  <span className="text-sm">{note.message}</span>
                  <button onClick={() => removeNotification(note.id)} className="text-xs font-semibold hover:opacity-70">×</button>
                </div>
              );
            })}
          </div>
        )}

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex items-center gap-6 p-4 rounded-lg border-2 ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300 bg-gray-50'}`}
        >
          <div className="flex-1">
            <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
              <div className="text-center">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Drag & drop J1939 files here</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse</p>
              </div>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <div className="w-72 flex flex-col gap-3">
            <div className="bg-white rounded-lg p-3 h-32 overflow-y-auto border">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase">Selected Files ({files.length})</h3>
                {files.length > 0 && (
                  <button onClick={clearAllFiles} className="text-red-500 text-xs hover:underline">Clear All</button>
                )}
              </div>
              <div className="mt-2">
                {files.length > 0 ? (
                  <ul className="space-y-1">
                    {files.map((file, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                        <span className="truncate w-40">{file.name}</span>
                        <button onClick={() => removeFile(idx)} className="text-red-500 hover:text-red-700">×</button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">No files selected</p>
                )}
              </div>
            </div>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className={`w-full py-2.5 rounded-lg text-white font-medium ${files.length === 0 || isUploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isUploading ? `Processing... ${uploadProgress}%` : 'Analyze Files'}
            </button>
          </div>
        </div>

        {isUploading && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {summaryData.length > 0 && (
        <div className="bg-white shadow-sm rounded-xl p-6 border">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Analysis Results</h2>
              <p className="text-sm text-gray-600">{summaryData.length} vehicle(s) analyzed</p>
            </div>
            <div className="flex gap-4 bg-gray-50 px-4 py-2 rounded-lg">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{totalSpnCount}</div>
                <div className="text-xs text-gray-600">SPNs</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{totalPgnCount}</div>
                <div className="text-xs text-gray-600">PGNs</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">{uniquePgnCount}</div>
                <div className="text-xs text-gray-600">Unique PGNs</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={exportCSV} className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-1">
              <Download className="h-4 w-4" /> CSV
            </button>
            <button onClick={exportPDF} className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-1">
              <Download className="h-4 w-4" /> PDF
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total PGNs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unique PGNs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SPNs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summaryData.map((vehicle, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{vehicle.vehicle}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{vehicle.brand}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]">{vehicle.filename}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{vehicle.pgnCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{vehicle.uniquePgnCount}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {vehicle.j1939_unique_spn_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openVehicleModal(vehicle)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer List Section */}
      <div className="bg-white shadow-sm rounded-xl p-6 border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Customer List</h2>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
            <button
              onClick={fetchCustomers}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
        )}

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{customer.full_name_english || customer.username}</div>
                      <div className="text-xs text-gray-500">@{customer.username}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{customer.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{customer.company || '-'}</td>
                    <td className="px-4 py-3">
                      {customer.is_approved ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {customer.date_joined ? new Date(customer.date_joined).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vehicle Details Modal */}
      {vehicleModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div>
                <h3 className="text-xl font-semibold">{selectedVehicle.vehicle || selectedVehicle.name}</h3>
                <p className="text-blue-100 text-sm">{selectedVehicle.brand} • {selectedVehicle.filename}</p>
              </div>
              <button onClick={() => setVehicleModalOpen(false)} className="text-white hover:text-blue-200">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedVehicle.j1939_unique_spn_count || 0}</div>
                  <div className="text-sm text-gray-600">Total SPNs</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedVehicle.pgnCount || 0}</div>
                  <div className="text-sm text-gray-600">Total PGNs</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedVehicle.uniquePgnCount || 0}</div>
                  <div className="text-sm text-gray-600">Unique PGNs</div>
                </div>
              </div>

              {/* SPN Details */}
              {selectedVehicle.j1939_spn_details && selectedVehicle.j1939_spn_details.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">SPN Details ({selectedVehicle.j1939_spn_details.length})</h4>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">PGN</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">SPN</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedVehicle.j1939_spn_details.slice(0, 50).map((spn, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs font-mono">{spn.pgn_hex || spn.pgn}</td>
                            <td className="px-3 py-2 text-xs font-medium text-blue-600">{spn.spn}</td>
                            <td className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate">{spn.description}</td>
                            <td className="px-3 py-2 text-xs text-gray-500">{spn.unit || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {selectedVehicle.j1939_spn_details.length > 50 && (
                      <div className="p-2 text-center text-sm text-gray-500 bg-gray-50">
                        Showing 50 of {selectedVehicle.j1939_spn_details.length} SPNs
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setVehicleModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}