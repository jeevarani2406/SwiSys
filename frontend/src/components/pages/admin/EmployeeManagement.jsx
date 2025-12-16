'use client';

import { useState, useEffect } from 'react';
import { UserCheck, UserX, Users, Search, RefreshCw, CheckCircle, XCircle, Clock, Shield, User } from 'lucide-react';
import apiClient from '../../../services/api';

export default function EmployeeManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('pending');
    const [roleFilter, setRoleFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch both employees and customers
            const [employeesRes, customersRes] = await Promise.all([
                apiClient.get('accounts/admin/employees/'),
                apiClient.get('accounts/admin/customers/')
            ]);
            
            const employees = (employeesRes.data.results || employeesRes.data || []).map(u => ({ ...u, role: 'employee' }));
            const customers = (customersRes.data.results || customersRes.data || []).map(u => ({ ...u, role: 'customer' }));
            
            setUsers([...employees, ...customers]);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load users. Please try again.');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId, approve = true, role) => {
        setProcessingId(userId);
        try {
            if (role === 'employee') {
                await apiClient.post(`accounts/admin/approve-employee/${userId}/`, { approved: approve });
            }
            // Update local state
            setUsers(prev => prev.map(user => 
                user.id === userId ? { ...user, is_approved: approve } : user
            ));
        } catch (err) {
            console.error('Failed to update user:', err);
            alert('Failed to update user status. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredUsers = users.filter(user => {
        // Apply role filter
        if (roleFilter !== 'all' && user.role !== roleFilter) return false;
        // Apply status filter
        if (filter === 'pending' && user.is_approved) return false;
        if (filter === 'approved' && !user.is_approved) return false;
        // Apply search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                user.username?.toLowerCase().includes(search) ||
                user.email?.toLowerCase().includes(search) ||
                user.full_name_english?.toLowerCase().includes(search) ||
                user.full_name_chinese?.toLowerCase().includes(search)
            );
        }
        return true;
    });

    const pendingCount = users.filter(e => !e.is_approved).length;
    const approvedCount = users.filter(e => e.is_approved).length;
    const employeeCount = users.filter(e => e.role === 'employee').length;
    const customerCount = users.filter(e => e.role === 'customer').length;

    const getRoleBadge = (role) => {
        if (role === 'employee') {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Shield className="h-3 w-3 mr-1" />Employee
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <User className="h-3 w-3 mr-1" />Customer
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Review Approvals</h2>
                <button onClick={fetchUsers} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <RefreshCw className="h-4 w-4 mr-2" />Refresh
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full"><Users className="h-6 w-6 text-blue-600" /></div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-full"><Clock className="h-6 w-6 text-yellow-600" /></div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Pending Approval</p>
                            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center">
                        <div className="p-3 bg-indigo-100 rounded-full"><Shield className="h-6 w-6 text-indigo-600" /></div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Employees</p>
                            <p className="text-2xl font-bold text-indigo-600">{employeeCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-full"><User className="h-6 w-6 text-purple-600" /></div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">Customers</p>
                            <p className="text-2xl font-bold text-purple-600">{customerCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" placeholder="Search by name, email, or username..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="all">All Roles</option>
                        <option value="employee">Employees</option>
                        <option value="customer">Customers</option>
                    </select>
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All ({users.length})</button>
                    <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Pending ({pendingCount})</button>
                    <button onClick={() => setFilter('approved')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Approved ({approvedCount})</button>
                </div>
            </div>

            {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                    <p className="text-gray-500">{filter === 'pending' ? 'No users are pending approval.' : filter === 'approved' ? 'No approved users found.' : 'No users match your search criteria.'}</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={`${user.role}-${user.id}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${user.role === 'employee' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                                    <span className={`font-medium text-sm ${user.role === 'employee' ? 'text-blue-600' : 'text-purple-600'}`}>{(user.full_name_english || user.username || '?')[0].toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.full_name_english || user.username}</div>
                                                {user.full_name_chinese && <div className="text-sm text-gray-500">{user.full_name_chinese}</div>}
                                                <div className="text-xs text-gray-400">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                        {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.is_approved ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {processingId === user.id ? (
                                            <div className="inline-flex items-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div></div>
                                        ) : user.role === 'employee' ? (
                                            user.is_approved ? (
                                                <button onClick={() => handleApprove(user.id, false, user.role)} className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"><UserX className="h-4 w-4 mr-1" />Revoke</button>
                                            ) : (
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => handleApprove(user.id, true, user.role)} className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"><UserCheck className="h-4 w-4 mr-1" />Approve</button>
                                                    <button onClick={() => handleApprove(user.id, false, user.role)} className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"><XCircle className="h-4 w-4 mr-1" />Reject</button>
                                                </div>
                                            )
                                        ) : (
                                            <span className="text-gray-400 text-xs">Auto-verified via OTP</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
