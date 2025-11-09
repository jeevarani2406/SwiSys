'use client';

import { useState, useEffect } from 'react';
import { Check, X, Eye, Search, Filter } from 'lucide-react';
import apiClient from '../../../services/api';

export default function EmployeeManagement() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved
    const [currentPage, setCururentPage] = useState(1);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/accounts/admin/employees/');
            setEmployees(response.data.results || response.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveEmployee = async (employeeId, approved) => {
        try {
            await apiClient.post(`/accounts/admin/approve-employee/${employeeId}/`, {
                approved
            });
            // Refresh the list
            fetchEmployees();
        } catch (error) {
            console.error('Failed to approve employee:', error);
            alert('Failed to update employee status');
        }
    };

    const filteredEmployees = employees.filter(employee => {
        const matchesSearch =
            employee.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'pending' && !employee.is_approved) ||
            (filterStatus === 'approved' && employee.is_approved);

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">Loading employees...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Employee Management</h2>
                <div className="flex space-x-2">
                    <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {employee.first_name} {employee.last_name}
                                            </div>
                                            {(employee.first_name_chinese || employee.last_name_chinese) && (
                                                <div className="text-sm text-gray-500">
                                                    {employee.first_name_chinese} {employee.last_name_chinese}
                                                </div>
                                            )}
                                            <div className="text-sm text-gray-500">@{employee.username}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{employee.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(employee.date_joined).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.is_approved
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {employee.is_approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {!employee.is_approved && (
                                            <button
                                                onClick={() => handleApproveEmployee(employee.id, true)}
                                                className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                                            >
                                                <Check className="h-3 w-3 mr-1" />
                                                Approve
                                            </button>
                                        )}
                                        {employee.is_approved && (
                                            <button
                                                onClick={() => handleApproveEmployee(employee.id, false)}
                                                className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
                                            >
                                                <X className="h-3 w-3 mr-1" />
                                                Revoke
                                            </button>
                                        )}
                                        <button className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                                            <Eye className="h-3 w-3 mr-1" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredEmployees.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-gray-500">No employees found matching your criteria.</div>
                    </div>
                )}
            </div>
        </div>
    );
}
