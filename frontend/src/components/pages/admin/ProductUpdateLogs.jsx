'use client';

import { useState, useEffect } from 'react';
import { FileUp, User, Clock, Eye, Search, Filter } from 'lucide-react';
import apiClient from '../../../services/api';

export default function ProductUpdateLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchFileUploadLogs();
    }, []);

    const fetchFileUploadLogs = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/j1939/vehicles/');
            const vehicles = Array.isArray(response.data) ? response.data : [];
            
            // Convert vehicle data to log format
            const formattedLogs = vehicles.map((vehicle, index) => ({
                id: vehicle.id,
                action: 'File Uploaded',
                filename: vehicle.source_file || vehicle.name,
                vehicle_name: vehicle.name,
                brand: vehicle.brand,
                uploaded_by: vehicle.uploaded_by_name || vehicle.uploaded_by || 'Unknown',
                uploaded_by_id: vehicle.uploaded_by,
                timestamp: vehicle.upload_date,
                pgn_count: vehicle.pgns || 0,
                spn_count: vehicle.spns || 0,
                details: {
                    Vehicle: vehicle.name,
                    Brand: vehicle.brand,
                    SourceFile: vehicle.source_file,
                    PGNs: vehicle.pgns,
                    SPNs: vehicle.spns
                }
            })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            setLogs(formattedLogs);
        } catch (error) {
            console.error('Failed to fetch file upload logs:', error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.uploaded_by.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAction =
            filterAction === 'all' || log.action === filterAction;

        return matchesSearch && matchesAction;
    });

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getActionBadgeColor = (action) => {
        const colors = {
            create: 'bg-green-100 text-green-800',
            update: 'bg-blue-100 text-blue-800',
            delete: 'bg-red-100 text-red-800'
        };
        return colors[action] || 'bg-gray-100 text-gray-800';
    };

    const showLogDetails = (log) => {
        setSelectedLog(log);
        setShowDetailModal(true);
    };

    const DetailModal = () => {
        if (!showDetailModal || !selectedLog) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">File Upload Details</h3>

                    <div className="space-y-3">
                        <div>
                            <span className="font-medium">File Name:</span>
                            <div className="text-sm text-gray-700 mt-1">{selectedLog.filename}</div>
                        </div>
                        <div>
                            <span className="font-medium">Vehicle:</span>
                            <div className="text-sm text-gray-700 mt-1">{selectedLog.vehicle_name}</div>
                        </div>
                        <div>
                            <span className="font-medium">Brand:</span>
                            <div className="text-sm text-gray-700 mt-1">{selectedLog.brand || 'N/A'}</div>
                        </div>
                        <div>
                            <span className="font-medium">Uploaded By:</span>
                            <div className="text-sm text-gray-700 mt-1">{selectedLog.uploaded_by}</div>
                        </div>
                        <div>
                            <span className="font-medium">Upload Date:</span>
                            <div className="text-sm text-gray-700 mt-1">{formatDateTime(selectedLog.timestamp)}</div>
                        </div>
                        <div>
                            <span className="font-medium">PGNs Count:</span>
                            <div className="text-sm text-gray-700 mt-1 bg-blue-50 px-2 py-1 rounded">{selectedLog.pgn_count}</div>
                        </div>
                        <div>
                            <span className="font-medium">SPNs Count:</span>
                            <div className="text-sm text-gray-700 mt-1 bg-green-50 px-2 py-1 rounded">{selectedLog.spn_count}</div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">Loading product update logs...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">File Upload Logs</h2>
                <div className="flex space-x-2">
                    <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search files, vehicles, or uploaders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    File
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vehicle
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Brand
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Uploaded By
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    PGNs/SPNs
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <FileUp className="h-5 w-5 text-blue-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                    {log.filename}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {log.vehicle_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {log.brand || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 text-gray-400 mr-2" />
                                            <div className="text-sm font-medium text-gray-900">
                                                {log.uploaded_by}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                            <div className="text-sm text-gray-900">
                                                {formatDateTime(log.timestamp)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1">PGNs: {log.pgn_count}</span>
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">SPNs: {log.spn_count}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => showLogDetails(log)}
                                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-gray-500">No file upload logs found matching your criteria.</div>
                    </div>
                )}
            </div>

            <DetailModal />
        </div>
    );
}
