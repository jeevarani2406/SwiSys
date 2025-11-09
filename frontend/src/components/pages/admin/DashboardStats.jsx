'use client';

import { Users, UserCheck, Package, Activity, TrendingUp, Clock } from 'lucide-react';

export default function DashboardStats({ stats, loading }) {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-red-600">Failed to load dashboard stats</div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats.total_users,
            icon: Users,
            color: 'blue',
            description: 'All registered users'
        },
        {
            title: 'Employees',
            value: stats.total_employees,
            icon: UserCheck,
            color: 'green',
            description: `${stats.pending_employees} pending approval`
        },
        {
            title: 'Customers',
            value: stats.total_customers,
            icon: Users,
            color: 'purple',
            description: 'Active customer accounts'
        },
        {
            title: 'Products',
            value: stats.total_products,
            icon: Package,
            color: 'orange',
            description: `${stats.active_products} active products`
        },
        {
            title: 'Recent Logins',
            value: stats.recent_logins,
            icon: Activity,
            color: 'indigo',
            description: 'Last 7 days'
        },
        {
            title: 'New Registrations',
            value: stats.recent_registrations,
            icon: TrendingUp,
            color: 'pink',
            description: 'Last 7 days'
        },
        {
            title: 'Product Updates',
            value: stats.recent_product_updates,
            icon: Clock,
            color: 'teal',
            description: 'Last 7 days'
        },
        {
            title: 'Pending Approvals',
            value: stats.pending_employees,
            icon: UserCheck,
            color: 'red',
            description: 'Employees awaiting approval'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-500 text-blue-100',
            green: 'bg-green-500 text-green-100',
            purple: 'bg-purple-500 text-purple-100',
            orange: 'bg-orange-500 text-orange-100',
            indigo: 'bg-indigo-500 text-indigo-100',
            pink: 'bg-pink-500 text-pink-100',
            teal: 'bg-teal-500 text-teal-100',
            red: 'bg-red-500 text-red-100'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                        {card.title}
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {card.value}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {card.description}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-full ${getColorClasses(card.color)}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            <UserCheck className="h-5 w-5 mr-2" />
                            Review Employee Approvals
                        </button>
                        <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                            <Package className="h-5 w-5 mr-2" />
                            Manage Products
                        </button>
                        <button className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                            <Activity className="h-5 w-5 mr-2" />
                            View Activity Logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
