// services/j1939Service.js
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

class J1939Service {
  constructor() {
    this.axios = axios.create({
      baseURL: API_BASE,
      withCredentials: true,
    });
  }

  // Upload files and analyze J1939 data
  async uploadFiles(files, onProgress = () => {}) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await this.axios.post('/api/j1939/upload/', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      // Process and format the response
      return this.formatResponse(response.data);
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // Format the backend response for frontend consumption
  formatResponse(data) {
    const vehicles = data.vehicles || [];
    const errors = data.errors || [];
    
    // Calculate totals
    let totalSpnCount = 0;
    let totalPgnCount = 0;
    
    const formattedVehicles = vehicles.map(vehicle => {
      // Derive counts even if backend didn't supply spn_count/pgn_count
      const derivedSpnCountFromList = (vehicle.spns && Array.isArray(vehicle.spns)) ? vehicle.spns.length : 0;
      const derivedPgnCountFromList = (vehicle.pgns && Array.isArray(vehicle.pgns)) ? vehicle.pgns.length : 0;
      const pgnSpnMapping = vehicle.pgn_spn_mapping || {};
      const derivedPgnCountFromMap = Object.keys(pgnSpnMapping).length;
      const derivedSpnCountFromMap = Object.values(pgnSpnMapping)
        .reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);

      const spnCount = vehicle.spn_count
        || derivedSpnCountFromList
        || derivedSpnCountFromMap
        || 0;

      const pgnCount = vehicle.pgn_count
        || derivedPgnCountFromList
        || derivedPgnCountFromMap
        || 0;

      totalSpnCount += spnCount;
      totalPgnCount += pgnCount;
      
      return {
        id: vehicle.id,
        vehicle: vehicle.name,
        name: vehicle.name,
        brand: vehicle.brand || 'Unknown',
        filename: vehicle.filename,
        source_file: vehicle.source_file,
        pgnCount,
        spnCount,
        upload_date: vehicle.upload_date || new Date().toISOString(),
        spns: vehicle.spns || [],
        pgns: vehicle.pgns || [],
        pgnSpnMapping,
        analysis_summary: vehicle.analysis_summary || {}
      };
    });

    return {
      vehicles: formattedVehicles,
      errors: errors,
      totals: {
        total_spn_count: totalSpnCount,
        total_pgn_count: totalPgnCount,
        total_vehicles: vehicles.length,
        ...(data.totals || {})
      }
    };
  }

  // Get detailed SPN information
  async getSPNDetails(spnId) {
    try {
      const response = await this.axios.get(`/api/j1939/spn/${spnId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching SPN details:', error);
      throw error;
    }
  }

  // Search SPNs
  async searchSPNs(query, filters = {}) {
    try {
      const params = { query, ...filters };
      const response = await this.axios.get('/api/j1939/search/', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching SPNs:', error);
      throw error;
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      const response = await this.axios.get('/api/j1939/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const j1939Service = new J1939Service();
export { API_BASE };