'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { productService } from '../../services/api';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      router.push('/login');
      return;
    }
    fetchProducts();
  }, [user, router]);

  // Fetch products that customer can view
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.first_name || user?.username}</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Account Summary */}
        <section className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium text-gray-700">Name</p>
              <p className="text-gray-900">{user?.first_name} {user?.last_name}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Email</p>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Role</p>
              <p className="text-gray-900 capitalize">{user?.role || 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Available Products</h2>
              <p className="text-gray-600 mt-1">Browse our product catalog</p>
            </div>
            <button
              onClick={fetchProducts}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
            >
              Refresh
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No products available.</p>
              <p className="text-sm text-gray-500 mt-2">Products will appear here when they are added.</p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
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
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${product.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock_quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleProductSelect(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Product Access</p>
                <p className="text-sm text-gray-600">You can view {products.length} products</p>
              </div>
              <span className="text-sm text-gray-500">Today</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-sm text-gray-600">Your account is active and in good standing</p>
              </div>
              <span className="text-sm text-gray-500">Active</span>
            </div>
          </div>
        </section>
      </main>

      {/* Product Details Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Product Details</h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Product Name</label>
                <p className="text-gray-900">{selectedProduct.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedProduct.description || 'No description available'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <p className="text-gray-900">{selectedProduct.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">SKU</label>
                <p className="text-gray-900">{selectedProduct.sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Price</label>
                <p className="text-gray-900">${selectedProduct.price}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
                <p className="text-gray-900">{selectedProduct.stock_quantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <p className="text-gray-900">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedProduct.is_active 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedProduct.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              {selectedProduct.created_by_name && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Created By</label>
                  <p className="text-gray-900">{selectedProduct.created_by_name}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  router.push('/contact');
                  setShowProductModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}