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

// dynamic import wrapper for xlsx
let XLSX = null;
const loadXLSX = async () => {
  if (!XLSX) {
    XLSX = await import('xlsx').then((mod) => mod.default || mod);
  }
  return XLSX;
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
  const [analysisTotals, setAnalysisTotals] = useState(null);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

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
  }, [user, router]);

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

  // UPLOAD API - UPDATED TO USE NEW SERVICE
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

      // Update totals from backend analysis
      setTotalSpnCount(totals.total_spn_count || 0);
      setTotalPgnCount(totals.total_pgn_count || 0);
      setAnalysisTotals(totals);

      if (vehicles.length > 0) {
        pushNotification('success', `✔ Analysis completed • Vehicles: ${vehicles.length} • SPNs: ${totals.total_spn_count || 0} • PGNs: ${totals.total_pgn_count || 0}`);
        
        // Display detailed statistics
        if (totals.unique_spns_across_all) {
          pushNotification('info', `📊 Unique SPNs across all files: ${totals.unique_spns_across_all}`);
        }
      }

      if (errors.length > 0) {
        errors.forEach((err) => {
          pushNotification('error', `❌ ${err.filename || 'File'}: ${err.error || 'Unknown error'}`);
        });
      }

      // Update summary data
      setSummaryData(vehicles.map((v) => ({
        id: v.id,
        vehicle: v.name,
        name: v.name,
        brand: v.brand || 'Unknown',
        filename: v.filename,
        source_file: v.source_file,
        pgnCount: v.pgnCount,
        spnCount: v.spnCount,
        upload_date: v.upload_date,
        spns: v.spns || [],
        pgns: v.pgns || [],
        pgnSpnMapping: v.pgnSpnMapping || {},
        analysis_summary: v.analysis_summary || {}
      })));

      setUploadProgress(100);

    } catch (err) {
      console.error('Upload failed:', err);
      pushNotification('error', `❌ Upload failed: ${err.message || 'Server error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Enhanced export functions that include PGN-SPN mapping
  const exportCSV = () => {
    if (!summaryData.length) return;

    const rows = [
      ['Vehicle Name', 'Brand', 'Source File', '# PGNs', '# SPNs', 'Unique SPNs', 'PGNs with SPNs', 'Upload Date'],
      ...summaryData.map((r) => [
        r.vehicle,
        r.brand,
        r.filename,
        r.pgnCount,
        r.spnCount,
        r.analysis_summary?.unique_spns || 'N/A',
        r.analysis_summary?.pgns_with_spns || 'N/A',
        r.upload_date || ''
      ])
    ];

    // Add totals row
    if (analysisTotals) {
      rows.push(['', '', '', '', '', '', '', '']);
      rows.push(['TOTALS', '', '', analysisTotals.total_pgn_count, analysisTotals.total_spn_count, 
                 analysisTotals.unique_spns_across_all || '', '', '']);
    }

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "j1939_analysis_detailed.csv";
    a.click();
  };

  const exportExcel = async () => {
    if (!summaryData.length) return;

    const XLSX = await loadXLSX();

    // Create summary sheet
    const summaryWs = XLSX.utils.aoa_to_sheet([
      ['J1939 Analysis Summary', '', '', '', '', '', '', ''],
      ['Generated', new Date().toLocaleString(), '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['Vehicle Name', 'Brand', 'Source File', '# PGNs', '# SPNs', 'Unique SPNs', 'PGNs with SPNs', 'Upload Date'],
      ...summaryData.map((r) => [
        r.vehicle,
        r.brand,
        r.filename,
        r.pgnCount,
        r.spnCount,
        r.analysis_summary?.unique_spns || 'N/A',
        r.analysis_summary?.pgns_with_spns || 'N/A',
        r.upload_date || ''
      ])
    ]);

    // Create totals sheet
    const totalsData = analysisTotals ? [
      ['Analysis Totals', ''],
      ['Total Vehicles', analysisTotals.total_vehicles],
      ['Total SPN Count', analysisTotals.total_spn_count],
      ['Total PGN Count', analysisTotals.total_pgn_count],
      ['Unique SPNs Across All', analysisTotals.unique_spns_across_all || 0],
      ['Unique PGNs Across All', analysisTotals.unique_pgns_across_all || 0]
    ] : [['No totals available', '']];

    const totalsWs = XLSX.utils.aoa_to_sheet(totalsData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    XLSX.utils.book_append_sheet(wb, totalsWs, 'Totals');

    const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "j1939_analysis.xlsx";
    a.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.text("J1939 Analysis Summary", 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);
    
    // Summary table
    doc.autoTable({
      head: [['Vehicle', 'Brand', 'File', 'PGNs', 'SPNs']],
      body: summaryData.map((r) => [r.vehicle, r.brand, r.filename, r.pgnCount, r.spnCount]),
      startY: 30,
      theme: 'grid'
    });
    
    // Add totals section
    const finalY = doc.lastAutoTable.finalY || 50;
    doc.setFontSize(12);
    doc.text("Analysis Totals", 14, finalY + 10);
    
    if (analysisTotals) {
      const totals = [
        ['Total Vehicles:', analysisTotals.total_vehicles],
        ['Total SPN Count:', analysisTotals.total_spn_count],
        ['Total PGN Count:', analysisTotals.total_pgn_count],
        ['Unique SPNs:', analysisTotals.unique_spns_across_all || 0],
        ['Unique PGNs:', analysisTotals.unique_pgns_across_all || 0]
      ];
      
      doc.autoTable({
        body: totals,
        startY: finalY + 15,
        theme: 'plain'
      });
    }
    
    doc.save("j1939_analysis.pdf");
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
      pushNotification('error', `❌ Failed to update profile: ${error.message}`);
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
        pushNotification('error', '❌ This file has already been uploaded');
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Upload Section */}
        <section>
          <div className="bg-white shadow-sm rounded-xl p-6 border">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Upload J1939 Data Files</h2>
            <p className="text-gray-500 text-sm mb-4">
              Upload J1939 data files (.csv, .txt, .log) for SPN analysis. Multiple files allowed.
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
                    <p className="text-xs text-gray-400">CSV, TXT, LOG files supported</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".csv,.txt,.log"
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
                The system will analyze J1939 data and map SPNs to their respective PGNs according to SAE J1939 standards.
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
                  Total analysis across {analysisTotals.total_vehicles} vehicle(s)
                </p>
              )}
            </div>
            
            {summaryData.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                {/* Totals Display */}
                <div className="flex gap-4 bg-gray-50 px-4 py-2 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalSpnCount}</div>
                    <div className="text-xs text-gray-600">Total SPNs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{totalPgnCount}</div>
                    <div className="text-xs text-gray-600">Total PGNs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{summaryData.length}</div>
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
      />

      {/* Profile Modal - Same as before */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* ... Profile modal content remains the same ... */}
          </div>
        </div>
      )}
    </div>
  );
}