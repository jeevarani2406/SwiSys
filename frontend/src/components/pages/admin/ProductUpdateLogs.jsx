'use client';

import { useState, useEffect } from 'react';
import { Package, User, Clock, Eye, Search, Filter } from 'lucide-react';
import apiClient from '../../../services/api';

export default function ProductUpdateLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchProductUpdateLogs();
    }, []);

    const fetchProductUpdateLogs = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/accounts/admin/product-logs/');
            setLogs(response.data.results || response.data);
        } catch (error) {
            console.error('Failed to fetch product update logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.employee_name.toLowerCase().includes(searchTerm.toLowerCase());

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
                    <h3 className="text-lg font-semibold mb-4">Change Details</h3>

                    <div className="space-y-3">
                        <div>
                            <span className="font-medium">Product:</span> {selectedLog.product_name}
                        </div>
                        <div>
                            <span className="font-medium">Employee:</span> {selectedLog.employee_name}
                        </div>
                        <div>
                            <span className="font-medium">Action:</span>
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(selectedLog.action)}`}>
                                {selectedLog.action}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium">Timestamp:</span> {formatDateTime(selectedLog.timestamp)}
                        </div>

                        {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                            <div>
                                <span className="font-medium">Changes:</span>
                                <div className="mt-2 bg-gray-50 p-3 rounded-md">
                                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {JSON.stringify(selectedLog.changes, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
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
                <h2 className="text-3xl font-bold text-gray-900">Product Update Logs</h2>
                <div className="flex space-x-2">
                    <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products or employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Actions</option>
                        <option value="create">Created</option>
                        <option value="update">Updated</option>
                        <option value="delete">Deleted</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Package className="h-5 w-5 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {log.product_name}
                                                </div>
                                                <div className="text-sm text-gray-500">ID: {log.product}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <User className="h-5 w-5 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {log.employee_name}
                                                </div>
                                                <div className="text-sm text-gray-500">ID: {log.employee}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                                            {log.action}
                                        </span>
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
                        <div className="text-gray-500">No product update logs found matching your criteria.</div>
                    </div>
                )}
            </div>

            <DetailModal />
        </div>
    );
}
