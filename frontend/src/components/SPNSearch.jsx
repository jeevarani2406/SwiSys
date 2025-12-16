'use client';

import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * SPNSearch Component
 * 
 * Search for SPNs within uploaded files and display which files contain the SPN
 * along with detailed SPN information (Physical Value, Units, Bit Range)
 * 
 * @param {Object} props
 * @param {Array} props.vehicles - Array of vehicle/file data with j1939_spn_details
 */
export default function SPNSearch({ vehicles = [] }) {
  const [spnInput, setSpnInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Build a map of all SPNs across all uploaded files
  const allSpnsMap = useMemo(() => {
    const spnMap = new Map();
    
    vehicles.forEach(vehicle => {
      const spnDetails = vehicle.j1939_spn_details || [];
      spnDetails.forEach(spn => {
        const spnNum = spn.spn;
        if (!spnMap.has(spnNum)) {
          spnMap.set(spnNum, {
            spn: spnNum,
            description: spn.description,
            unit: spn.unit,
            resolution: spn.resolution,
            offset: spn.offset,
            start_byte: spn.start_byte,
            start_bit: spn.start_bit,
            bit_length: spn.bit_length,
            pgn: spn.pgn,
            pgn_hex: spn.pgn_hex,
            files: []
          });
        }
        // Add this file to the list of files containing this SPN
        const existing = spnMap.get(spnNum);
        if (!existing.files.find(f => f.name === (vehicle.name || vehicle.vehicle))) {
          existing.files.push({
            name: vehicle.name || vehicle.vehicle,
            brand: vehicle.brand,
            source_file: vehicle.source_file || vehicle.filename
          });
        }
      });
    });
    
    return spnMap;
  }, [vehicles]);

  // Get list of all unique SPNs for autocomplete/suggestions
  const allSpnNumbers = useMemo(() => {
    return Array.from(allSpnsMap.keys()).sort((a, b) => a - b);
  }, [allSpnsMap]);

  const handleSearch = (e) => {
    e?.preventDefault();

    const cleaned = spnInput.trim();
    if (!cleaned) {
      setSearchResult({ error: 'Enter an SPN number to search.' });
      return;
    }

    const spnNum = parseInt(cleaned, 10);
    if (isNaN(spnNum)) {
      setSearchResult({ error: 'Please enter a valid SPN number.' });
      return;
    }

    if (allSpnsMap.has(spnNum)) {
      setSearchResult({ found: true, data: allSpnsMap.get(spnNum) });
    } else {
      setSearchResult({ 
        found: false, 
        error: `SPN ${spnNum} not found in uploaded files. Available SPNs: ${allSpnNumbers.length}`
      });
    }
  };

  // Calculate physical value formula
  const getPhysicalValue = (spnData) => {
    if (spnData.resolution && spnData.offset !== undefined) {
      return `${spnData.resolution} × raw + ${spnData.offset}`;
    }
    return '-';
  };

  // Format bit range
  const getBitRange = (spnData) => {
    if (spnData.start_byte !== undefined && spnData.bit_length !== undefined) {
      const startBit = (spnData.start_byte - 1) * 8 + (spnData.start_bit || 0);
      const endBit = startBit + spnData.bit_length - 1;
      return `${startBit}-${endBit}`;
    }
    return '-';
  };

  const headers = ['Vehicle/File', 'Brand', 'Source File'];
  const rows = useMemo(
    () =>
      (searchResult?.data?.files || []).map((file) => [
        file.name || '',
        file.brand || '',
        file.source_file || ''
      ]),
    [searchResult]
  );

  const exportCSV = () => {
    if (!rows.length) return;
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spn-${searchResult?.data?.spn}-files.csv`;
    link.click();
  };

  const exportExcel = async () => {
    if (!rows.length || exporting) return;
    setExporting(true);
    try {
      const XLSX = await import('xlsx').then((mod) => mod.default || mod);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Files');
      XLSX.writeFile(wb, `spn-${searchResult?.data?.spn}-files.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = () => {
    if (!rows.length) return;
    const doc = new jsPDF();
    doc.text(`SPN ${searchResult?.data?.spn} - Files`, 14, 16);
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 20,
    });
    doc.save(`spn-${searchResult?.data?.spn}-files.pdf`);
  };

  // No uploaded files yet
  if (vehicles.length === 0) {
    return (
      <section className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">SPN Search / File Mapping</p>
            <h2 className="text-lg font-semibold text-gray-900">Find files that contain an SPN</h2>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg font-medium">No files uploaded yet</p>
          <p className="text-sm mt-1">Upload J1939 files to search for SPNs</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">SPN Search / File Mapping</p>
          <h2 className="text-lg font-semibold text-gray-900">Find files that contain an SPN</h2>
          <p className="text-xs text-gray-400 mt-1">
            {allSpnNumbers.length} unique SPNs available across {vehicles.length} file(s)
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 w-full md:w-auto">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            className="flex-1 md:w-48 border rounded-lg px-3 py-2 text-sm"
            placeholder="Enter SPN number"
            value={spnInput}
            onChange={(e) => setSpnInput(e.target.value)}
            list="spn-suggestions"
          />
          <datalist id="spn-suggestions">
            {allSpnNumbers.slice(0, 100).map(spn => (
              <option key={spn} value={spn} />
            ))}
          </datalist>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-white text-sm font-medium bg-blue-600 hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Error Message */}
      {searchResult?.error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {searchResult.error}
        </div>
      )}

      {/* Search Result */}
      {searchResult?.found && searchResult?.data && (
        <div>
          {/* SPN Details Card */}
          <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-lg font-bold bg-green-200 text-green-800">
                    SPN {searchResult.data.spn}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-sm bg-blue-100 text-blue-800">
                    PGN: {searchResult.data.pgn_hex} ({searchResult.data.pgn})
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {searchResult.data.description || 'No description provided'}
                </h3>
                
                {/* SPN Details Table */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white p-2 rounded border">
                    <span className="text-gray-500 text-xs block">Physical Value</span>
                    <span className="font-mono text-blue-700">{getPhysicalValue(searchResult.data)}</span>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <span className="text-gray-500 text-xs block">Units</span>
                    <span className="font-medium">{searchResult.data.unit || '-'}</span>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <span className="text-gray-500 text-xs block">Bit Range</span>
                    <span className="font-mono text-purple-700">{getBitRange(searchResult.data)}</span>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <span className="text-gray-500 text-xs block">Bit Length</span>
                    <span className="font-mono">{searchResult.data.bit_length || '-'} bits</span>
                  </div>
                </div>
              </div>

              {rows.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs">
                  <button onClick={exportCSV} className="px-3 py-1.5 border rounded hover:bg-white bg-white/50">
                    Export CSV
                  </button>
                  <button
                    onClick={exportExcel}
                    disabled={exporting}
                    className={`px-3 py-1.5 border rounded bg-white/50 ${
                      exporting ? 'text-gray-400 border-gray-200' : 'hover:bg-white'
                    }`}
                  >
                    {exporting ? 'Exporting…' : 'Export Excel'}
                  </button>
                  <button onClick={exportPDF} className="px-3 py-1.5 border rounded hover:bg-white bg-white/50">
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Files containing this SPN */}
          <div className="mb-2">
            <h4 className="text-sm font-semibold text-gray-700">
              Files containing SPN {searchResult.data.spn} ({searchResult.data.files.length} file{searchResult.data.files.length !== 1 ? 's' : ''})
            </h4>
          </div>

          {rows.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Vehicle/File
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Brand
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Source File
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {searchResult.data.files.map((file, idx) => (
                    <tr key={`${file.name}-${idx}`} className="hover:bg-green-50">
                      <td className="px-4 py-2 text-sm text-gray-900 font-medium">{file.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{file.brand || '—'}</td>
                      <td className="px-4 py-2 text-sm text-gray-500 truncate max-w-xs" title={file.source_file}>
                        {file.source_file || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No files found for this SPN.
            </p>
          )}
        </div>
      )}

      {/* Quick SPN List - show available SPNs if no search yet */}
      {!searchResult && allSpnNumbers.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Available SPNs (click to search)</h4>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-lg">
            {allSpnNumbers.map(spn => (
              <button
                key={spn}
                onClick={() => {
                  setSpnInput(String(spn));
                  const spnData = allSpnsMap.get(spn);
                  setSearchResult({ found: true, data: spnData });
                }}
                className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
              >
                {spn}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}


