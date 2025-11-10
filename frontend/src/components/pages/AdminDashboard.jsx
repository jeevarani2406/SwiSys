'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Package,
    Activity,
    UserCheck,
    UserX,
    Plus,
    Eye,
    BarChart3,
    LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/api';

// Sub-components
import DashboardStats from './admin/DashboardStats';
import EmployeeManagement from './admin/EmployeeManagement';
import CustomerManagement from './admin/CustomerManagement';
import ProductManagement from './admin/ProductManagement';
import LoginLogs from './admin/LoginLogs';
import ProductUpdateLogs from './admin/ProductUpdateLogs';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const statsData = await adminService.getDashboardStats();
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'employees', label: 'Employees', icon: UserCheck },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'login-logs', label: 'Login Logs', icon: Activity },
        { id: 'product-logs', label: 'Product Logs', icon: Eye },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardStats stats={stats} loading={loading} />;
            case 'employees':
                return <EmployeeManagement />;
            case 'customers':
                return <CustomerManagement />;
            case 'products':
                return <ProductManagement />;
            case 'login-logs':
                return <LoginLogs />;
            case 'product-logs':
                return <ProductUpdateLogs />;
            default:
                return <DashboardStats stats={stats} loading={loading} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                            Welcome, {user?.full_name_english || user?.username}
                        </span>
                        <button
                            onClick={logout}
                            className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                        >
                            <LogOut className="h-4 w-4 mr-1" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <nav className="w-64 bg-white shadow-sm min-h-screen">
                    <div className="p-4">
                        <ul className="space-y-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <li key={tab.id}>
                                        <button
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${activeTab === tab.id
                                                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon className="h-5 w-5 mr-3" />
                                            {tab.label}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}