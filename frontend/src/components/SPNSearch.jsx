'use client';

import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { j1939Service } from '../services/j1939Service';

export default function SPNSearch() {
  const [spnInput, setSpnInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [exporting, setExporting] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setError(null);

    const cleaned = spnInput.trim();
    if (!cleaned) {
      setError('Enter an SPN number to search.');
      setResult(null);
      return;
    }

    setLoading(true);
    try {
      const data = await j1939Service.getSpnVehicles(cleaned);
      setResult(data);
      if (data.vehicles?.length === 0) {
        setError('No vehicles support this SPN.');
      }
    } catch (err) {
      setResult(null);
      setError(err.message || 'Failed to fetch SPN data.');
    } finally {
      setLoading(false);
    }
  };

  const headers = ['Vehicle', 'Brand'];
  const rows = useMemo(
    () =>
      (result?.vehicles || []).map((vehicle) => [
        vehicle.name || '',
        vehicle.brand || '',
      ]),
    [result]
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
    link.download = `spn-${result.spn}-vehicles.csv`;
    link.click();
  };

  const exportExcel = async () => {
    if (!rows.length || exporting) return;
    setExporting(true);
    try {
      const XLSX = await import('xlsx').then((mod) => mod.default || mod);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Vehicles');
      XLSX.writeFile(wb, `spn-${result.spn}-vehicles.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = () => {
    if (!rows.length) return;
    const doc = new jsPDF();
    doc.text(`SPN ${result.spn} Vehicles`, 14, 16);
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 20,
    });
    doc.save(`spn-${result.spn}-vehicles.pdf`);
  };

  return (
    <section className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">SPN Search / Vehicle Mapping</p>
          <h2 className="text-lg font-semibold text-gray-900">Find vehicles that support an SPN</h2>
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
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {result && (
        <div>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">SPN #{result.spn}</p>
              <h3 className="text-xl font-semibold text-gray-900">{result.description || 'No description provided'}</h3>
            </div>
            {rows.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs">
                <button onClick={exportCSV} className="px-3 py-1.5 border rounded hover:bg-gray-50">
                  Export CSV
                </button>
                <button
                  onClick={exportExcel}
                  disabled={exporting}
                  className={`px-3 py-1.5 border rounded ${
                    exporting ? 'text-gray-400 border-gray-200' : 'hover:bg-gray-50'
                  }`}
                >
                  {exporting ? 'Exporting…' : 'Export Excel'}
                </button>
                <button onClick={exportPDF} className="px-3 py-1.5 border rounded hover:bg-gray-50">
                  Export PDF
                </button>
              </div>
            )}
          </div>

          {rows.length > 0 ? (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Vehicle
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Brand
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {result.vehicles.map((vehicle, idx) => (
                    <tr key={`${vehicle.name}-${idx}`} className="hover:bg-blue-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{vehicle.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{vehicle.brand || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && (
              <p className="text-sm text-gray-500">
                No vehicles found for this SPN. Try another number.
              </p>
            )
          )}
        </div>
      )}
    </section>
  );
}


