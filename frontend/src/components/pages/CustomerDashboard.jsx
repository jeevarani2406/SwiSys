'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '../../services/api';

export default function CustomerDashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (!user || user.role !== 'customer') {
            router.push('/login');
            return;
        }
        fetchProducts();
    }, [user, router]);

    const fetchProducts = async () => {
        try {
            const response = await apiClient.get('/accounts/products/');
            const productData = response.data.results || response.data;
            setProducts(productData);

            // Extract unique categories
            const uniqueCategories = [...new Set(productData.map(product => product.category))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const isActive = product.is_active; // Only show active products to customers

        return matchesSearch && matchesCategory && isActive;
    });

    const downloadProductData = () => {
        const csvContent = "data:text/csv;charset=utf-8," +
            "Name,Description,Category,Price,Stock,SKU\n" +
            filteredProducts.map(product =>
                `"${product.name}","${product.description}","${product.category}",${product.price},${product.stock_quantity},"${product.sku}"`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "products.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
                            <p className="text-gray-600">Welcome, {user?.first_name || user?.username}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={downloadProductData}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download CSV
                        </button>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Available Products ({filteredProducts.length})
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">View and download product information</p>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2m16-7V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4m16 0H4" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                            {product.name}
                                        </h3>
                                        <span className="text-lg font-bold text-green-600">
                                            ${product.price}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p className="line-clamp-2">
                                            {product.description || 'No description available'}
                                        </p>

                                        <div className="flex justify-between">
                                            <span className="font-medium">Category:</span>
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                {product.category}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="font-medium">Stock:</span>
                                            <span className={`px-2 py-1 rounded text-xs ${product.stock_quantity > 0
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {product.stock_quantity} units
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="font-medium">SKU:</span>
                                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                {product.sku}
                                            </span>
                                        </div>

                                        {product.created_by_name && (
                                            <div className="flex justify-between">
                                                <span className="font-medium">Added by:</span>
                                                <span className="text-xs">
                                                    {product.created_by_name}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-200">
                                        <div className="text-xs text-gray-500">
                                            Created: {new Date(product.created_at).toLocaleDateString()}
                                        </div>
                                        {product.updated_at !== product.created_at && (
                                            <div className="text-xs text-gray-500">
                                                Updated: {new Date(product.updated_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Footer */}
            <div className="bg-blue-50 border-t border-blue-200 mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-center text-sm text-blue-700">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        You have view-only access to product information. Use the download button to export data.
                    </div>
                </div>
            </div>
        </div>
    );
}
