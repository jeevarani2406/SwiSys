'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Eye, Search, Filter, DollarSign, Upload, FileText, Download, RefreshCw, User, Calendar, BarChart3, Clock, XCircle } from 'lucide-react';
import { productService } from '../../../services/api';
import { j1939Service, API_BASE } from '../../../services/j1939Service';
import apiClient from '../../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ProductManagement() {
    // Uploaded Files State
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [filesLoading, setFilesLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploaderFilter, setUploaderFilter] = useState('all');
    
    // File upload state
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    
    // Update logs
    const [updateLogs, setUpdateLogs] = useState([]);
    
    // Modal state
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileDetailModalOpen, setFileDetailModalOpen] = useState(false);
    
    // Notifications
    const [notifications, setNotifications] = useState([]);

    // Unique uploaders list
    const [uploaders, setUploaders] = useState([]);

    useEffect(() => {
        fetchUploadedFiles();
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

    const fetchUploadedFiles = async () => {
        setFilesLoading(true);
        try {
            const response = await apiClient.get('/api/j1939/vehicles/');
            const data = response.data || [];
            setUploadedFiles(Array.isArray(data) ? data : []);
            
            // Extract unique uploaders
            const uniqueUploaders = [...new Set(data.map(f => f.uploaded_by_name || f.uploaded_by || 'Unknown').filter(Boolean))];
            setUploaders(uniqueUploaders);
            
            // Generate update logs from files
            const logs = data.map(file => ({
                id: file.id,
                action: 'File Uploaded',
                filename: file.source_file || file.name,
                vehicle: file.name,
                brand: file.brand,
                uploaded_by: file.uploaded_by_name || file.uploaded_by || 'Unknown',
                upload_date: file.upload_date,
                pgn_count: file.pgns || 0,
                spn_count: file.spns || 0
            })).sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
            setUpdateLogs(logs);
            
        } catch (error) {
            console.error('Failed to fetch uploaded files:', error);
            pushNotification('error', 'Failed to load uploaded files');
            setUploadedFiles([]);
        } finally {
            setFilesLoading(false);
        }
    };

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
            pushNotification('success', `✔ ${toAdd.length} file(s) added for upload`);
        }
    };

    const handleFileChange = (e) => onFilesAdded(e.target.files);
    const handleDrop = (e) => { e.preventDefault(); setDragActive(false); onFilesAdded(e.dataTransfer.files); };
    const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false); };
    const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));
    const clearAllFiles = () => setFiles([]);

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

            if (vehicles.length > 0) {
                pushNotification('success', `✔ Successfully uploaded ${vehicles.length} file(s)`);
            }

            if (errors.length > 0) {
                errors.forEach((err) => {
                    pushNotification('error', `❌ ${err.filename || 'File'}: ${err.error || 'Unknown error'}`);
                });
            }

            setUploadProgress(100);
            setFiles([]);
            fetchUploadedFiles(); // Refresh the list
        } catch (err) {
            console.error('Upload failed:', err);
            pushNotification('error', `❌ Upload failed: ${err.message || 'Server error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    const filteredFiles = uploadedFiles.filter(file => {
        const matchesSearch = 
            file.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.source_file?.toLowerCase().includes(searchTerm.toLowerCase());

        const uploaderName = file.uploaded_by_name || file.uploaded_by || 'Unknown';
        const matchesUploader = uploaderFilter === 'all' || uploaderName === uploaderFilter;

        return matchesSearch && matchesUploader;
    });

    const filteredLogs = updateLogs.filter(log => {
        const matchesSearch = 
            log.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.uploaded_by?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesUploader = uploaderFilter === 'all' || log.uploaded_by === uploaderFilter;

        return matchesSearch && matchesUploader;
    });

    const totalFiles = uploadedFiles.length;
    const totalPGNs = uploadedFiles.reduce((sum, f) => sum + (f.pgns || 0), 0);
    const totalSPNs = uploadedFiles.reduce((sum, f) => sum + (f.spns || 0), 0);

    const openFileDetail = (file) => {
        setSelectedFile(file);
        setFileDetailModalOpen(true);
    };

    const exportLogsCSV = () => {
        if (!filteredLogs.length) {
            pushNotification('info', 'No logs to export.');
            return;
        }
        const rows = [
            ['Date', 'Action', 'Vehicle', 'Brand', 'Filename', 'Uploaded By', 'PGNs', 'SPNs'],
            ...filteredLogs.map((log) => [
                log.upload_date ? new Date(log.upload_date).toLocaleString() : '',
                log.action,
                log.vehicle,
                log.brand || '',
                log.filename,
                log.uploaded_by,
                log.pgn_count,
                log.spn_count
            ])
        ];
        const csv = rows.map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = "upload_logs.csv";
        a.click();
        pushNotification('success', 'CSV export started.');
    };

    const exportLogsPDF = () => {
        if (!filteredLogs.length) {
            pushNotification('info', 'No logs to export.');
            return;
        }
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Product Update Logs", 14, 16);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);
        doc.autoTable({
            head: [['Date', 'Action', 'Vehicle', 'Brand', 'Uploaded By', 'PGNs', 'SPNs']],
            body: filteredLogs.map((log) => [
                log.upload_date ? new Date(log.upload_date).toLocaleDateString() : '',
                log.action,
                log.vehicle,
                log.brand || '',
                log.uploaded_by,
                log.pgn_count,
                log.spn_count
            ]),
            startY: 30,
            theme: 'grid'
        });
        doc.save("upload_logs.pdf");
        pushNotification('success', 'PDF export started.');
    };

    if (filesLoading) {
        return (
            <div className="flex justify-center items-center h-64">
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
                            <p className="text-sm text-gray-500">Total Uploaded Files</p>
                            <p className="text-2xl font-bold text-gray-900">{totalFiles}</p>
                        </div>
                        <FileText className="h-10 w-10 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total PGNs</p>
                            <p className="text-2xl font-bold text-gray-900">{totalPGNs}</p>
                        </div>
                        <BarChart3 className="h-10 w-10 text-green-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total SPNs</p>
                            <p className="text-2xl font-bold text-gray-900">{totalSPNs}</p>
                        </div>
                        <BarChart3 className="h-10 w-10 text-purple-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Unique Uploaders</p>
                            <p className="text-2xl font-bold text-gray-900">{uploaders.length}</p>
                        </div>
                        <User className="h-10 w-10 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-white shadow-sm rounded-xl p-6 border">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload J1939 Data Files</h2>
                <p className="text-gray-500 text-sm mb-4">
                    Upload J1939 data files (.csv, .txt, .log, .xlsx, .xls) for analysis
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
                            {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Files'}
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

            {/* Uploaded Files List */}
            <div className="bg-white shadow-sm rounded-xl p-6 border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">All Uploaded Files</h2>
                        <p className="text-sm text-gray-500">{filteredFiles.length} files found</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={uploaderFilter}
                            onChange={(e) => setUploaderFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Uploaders</option>
                            {uploaders.map((uploader, idx) => (
                                <option key={idx} value={uploader}>{uploader}</option>
                            ))}
                        </select>
                        <button
                            onClick={fetchUploadedFiles}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="Refresh"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {filteredFiles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No uploaded files found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle/File</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upload Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PGNs</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SPNs</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredFiles.map((file) => (
                                    <tr key={file.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                                            <div className="text-xs text-gray-500">{file.source_file || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{file.brand || '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                                    <User className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <span className="text-sm text-gray-900">{file.uploaded_by_name || file.uploaded_by || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {file.upload_date ? new Date(file.upload_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                {file.pgns || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                {file.spns || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => openFileDetail(file)}
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
                )}
            </div>

            {/* Product Update Logs */}
            <div className="bg-white shadow-sm rounded-xl p-6 border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Product Update Logs</h2>
                        <p className="text-sm text-gray-500">Track all file uploads and changes by user</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={exportLogsCSV} className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-1">
                            <Download className="h-4 w-4" /> CSV
                        </button>
                        <button onClick={exportLogsPDF} className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-1">
                            <Download className="h-4 w-4" /> PDF
                        </button>
                    </div>
                </div>

                {filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No update logs found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PGNs</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SPNs</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLogs.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {log.upload_date ? new Date(log.upload_date).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <Upload className="h-3 w-3 mr-1" /> {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.vehicle}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{log.brand || '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                                                    <span className="text-xs font-medium text-indigo-600">
                                                        {(log.uploaded_by || 'U')[0].toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-900">{log.uploaded_by}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.pgn_count}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{log.spn_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* File Detail Modal */}
            {fileDetailModalOpen && selectedFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                            <div>
                                <h3 className="text-xl font-semibold">{selectedFile.name}</h3>
                                <p className="text-blue-100 text-sm">{selectedFile.brand || 'Unknown Brand'}</p>
                            </div>
                            <button onClick={() => setFileDetailModalOpen(false)} className="text-white hover:text-blue-200">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{selectedFile.pgns || 0}</div>
                                    <div className="text-sm text-gray-600">Total PGNs</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{selectedFile.spns || 0}</div>
                                    <div className="text-sm text-gray-600">Total SPNs</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Uploaded By</div>
                                        <div className="font-medium">{selectedFile.uploaded_by_name || selectedFile.uploaded_by || 'Unknown'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Upload Date</div>
                                        <div className="font-medium">{selectedFile.upload_date ? new Date(selectedFile.upload_date).toLocaleString() : '-'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Source File</div>
                                        <div className="font-medium">{selectedFile.source_file || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setFileDetailModalOpen(false)}
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
