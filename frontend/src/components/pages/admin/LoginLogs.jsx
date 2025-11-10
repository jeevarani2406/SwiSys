'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, Clock, Filter, Search } from 'lucide-react';
import { adminService } from '../../../services/api';

export default function LoginLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        fetchLoginLogs();
    }, []);

    const fetchLoginLogs = async () => {
        try {
            setLoading(true);
            const data = await adminService.getLoginLogs();
            setLogs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch login logs:', error);
            const errorMsg = error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch login logs';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user_role.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole =
            filterRole === 'all' || log.user_role === filterRole;

        return matchesSearch && matchesRole;
    });

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            admin: 'bg-red-100 text-red-800',
            employee: 'bg-purple-100 text-purple-800',
            customer: 'bg-blue-100 text-blue-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">Loading login logs...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Login Logs</h2>
                <div className="flex space-x-2">
                    <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                        <option value="customer">Customer</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Login Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    IP Address
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <User className="h-5 w-5 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {log.user_name}
                                                </div>
                                                <div className="text-sm text-gray-500">ID: {log.user}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(log.user_role)}`}>
                                            {log.user_role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                            <div className="text-sm text-gray-900">
                                                {formatDateTime(log.login_time)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {log.ip_address || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${log.success
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {log.success ? 'Success' : 'Failed'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-gray-500">No login logs found matching your criteria.</div>
                    </div>
                )}
            </div>
        </div>
    );
}
