'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '../../services/api';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [firmwareList, setFirmwareList] = useState([]);
  const [selectedFirmware, setSelectedFirmware] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showFirmwareModal, setShowFirmwareModal] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      router.push('/login/customer');
      return;
    }
    fetchAllowedFirmware();
  }, [user, router]);

  // Fetch firmware that customer is allowed to access
  const fetchAllowedFirmware = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/customer/firmware/allowed');
      setFirmwareList(response.data || []);
    } catch (error) {
      console.error('Error fetching firmware:', error);
      setFirmwareList([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle firmware selection
  const handleFirmwareSelect = (firmware) => {
    setSelectedFirmware(firmware);
    setShowFirmwareModal(true);
  };

  // Handle firmware download
  const handleDownload = async (firmwareId) => {
    setDownloading(true);
    try {
      const response = await apiClient.get(`/api/customer/firmware/download/${firmwareId}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'firmware.bin';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Log download activity
      await apiClient.post('/api/customer/firmware/download-log', {
        firmware_id: firmwareId,
        downloaded_at: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
      setShowFirmwareModal(false);
    }
  };

  // Handle PGN/SPN request
  const handlePGNRequest = async (requestData) => {
    try {
      await apiClient.post('/api/customer/pgn-requests', requestData);
      alert('PGN/SPN request submitted successfully!');
    } catch (error) {
      console.error('Request submission failed:', error);
      alert('Failed to submit request. Please try again.');
    }
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
              <p className="font-medium text-gray-700">Company</p>
              <p className="text-gray-900">{user?.company_name || 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* Allowed Firmware Section */}
        <section className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Allowed Firmware</h2>
              <p className="text-gray-600 mt-1">Firmware files you have permission to download</p>
            </div>
            <button
              onClick={fetchAllowedFirmware}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
            >
              Refresh
            </button>
          </div>

          {firmwareList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No firmware available for your account.</p>
              <p className="text-sm text-gray-500 mt-2">Contact your administrator for access.</p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {firmwareList.map((firmware) => (
                    <tr key={firmware.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          firmware.data_source === 'manual' 
                            ? 'bg-blue-100 text-blue-800'
                            : firmware.data_source === 'automatic'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {firmware.data_source}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{firmware.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{firmware.version}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">Employee #{firmware.employee_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleFirmwareSelect(firmware)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDownload(firmware.id)}
                          disabled={downloading}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          {downloading ? 'Downloading...' : 'Download'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* PGN/SPN Request Section */}
        <section className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">PGN/SPN Data Request</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 mb-4">
              Need specific vehicle parameter data? Submit a request and our team will prepare it for you.
            </p>
            <button
              onClick={() => router.push('/customer/pgn-request')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Submit PGN/SPN Request
            </button>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Firmware Access</p>
                <p className="text-sm text-gray-600">You have access to {firmwareList.length} firmware files</p>
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

      {/* Firmware Details Modal */}
      {showFirmwareModal && selectedFirmware && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Firmware Details</h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Data Source</label>
                <p className="text-gray-900">{selectedFirmware.data_source}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedFirmware.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Version</label>
                <p className="text-gray-900">{selectedFirmware.version}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Added By</label>
                <p className="text-gray-900">Employee #{selectedFirmware.employee_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">File Size</label>
                <p className="text-gray-900">{selectedFirmware.file_size || 'N/A'}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowFirmwareModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDownload(selectedFirmware.id)}
                disabled={downloading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {downloading ? 'Downloading...' : 'Download Firmware'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}