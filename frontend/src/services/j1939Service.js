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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
        // Increase timeout for large files
        timeout: 300000, // 5 minutes
      });

      // Process and format the response
      return this.formatResponse(response.data);
    } catch (error) {
      console.error('Upload error:', error);
      
      // Extract detailed error message
      let errorMessage = 'Upload failed';
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'object') {
          if (data.errors && Array.isArray(data.errors)) {
            errorMessage = data.errors.map(e => e.error || e.filename || String(e)).join('; ');
          } else if (data.error) {
            errorMessage = data.error;
          } else {
            const fieldErrors = Object.entries(data)
              .map(([field, msgs]) => {
                const msgText = Array.isArray(msgs) ? msgs.join(', ') : msgs;
                return `${field}: ${msgText}`;
              })
              .join('; ');
            errorMessage = fieldErrors || JSON.stringify(data);
          }
        } else {
          errorMessage = String(data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Create a new error with the detailed message
      const enhancedError = new Error(errorMessage);
      enhancedError.response = error.response;
      enhancedError.originalError = error;
      throw enhancedError;
    }
  }

  // Format the backend response for frontend consumption
  formatResponse(data) {
    const vehicles = data.vehicles || [];
    const errors = data.errors || [];
    
    // Calculate totals
    let totalSpnCount = 0;
    let totalPgnCount = 0;
    let totalJ1939SpnCount = 0;
    
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

      // J1939 Standard SPN count (mapped from PGNs)
      const j1939SpnCount = vehicle.j1939_unique_spn_count || 0;
      const j1939SpnList = vehicle.j1939_spn_list || [];
      const j1939SpnDetails = vehicle.j1939_spn_details || [];

      totalSpnCount += spnCount;
      totalPgnCount += pgnCount;
      totalJ1939SpnCount += j1939SpnCount;
      
      return {
        id: vehicle.id,
        vehicle: vehicle.name,
        name: vehicle.name,
        brand: vehicle.brand || 'Unknown',
        filename: vehicle.filename,
        source_file: vehicle.source_file,
        pgnCount,
        spnCount,
        // J1939 Standard SPN data
        j1939_unique_spn_count: j1939SpnCount,
        j1939_spn_list: j1939SpnList,
        j1939_spn_details: j1939SpnDetails,
        // PGN stats
        total_pgn_messages: vehicle.total_pgn_messages || 0,
        unique_pgn_count: vehicle.unique_pgn_count || pgnCount,
        unique_pgn_list: vehicle.unique_pgn_list || [],
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
        // J1939 Standard SPN totals
        j1939_unique_spn_count: data.totals?.j1939_unique_spn_count || totalJ1939SpnCount,
        j1939_spn_list: data.totals?.j1939_spn_list || [],
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

  // Map PGNs to SPNs - POST a list of PGNs and get SPN details
  async mapPGNsToSPNs(pgnList) {
    try {
      const response = await this.axios.post('/api/j1939/pgn-spn-mapping/', {
        pgn_list: pgnList
      });
      return response.data;
    } catch (error) {
      console.error('Error mapping PGNs to SPNs:', error);
      throw error;
    }
  }

  // Upload SPN master CSV file
  async uploadSPNMaster(file, onProgress = () => {}) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.axios.post('/api/j1939/upload-spn-master/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading SPN master:', error);
      throw error;
    }
  }

  // Analyze PGNs from uploaded file and get SPN mappings
  async analyzePGNsFromFile(file, onProgress = () => {}) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.axios.post('/api/j1939/analyze-pgns/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing PGNs from file:', error);
      throw error;
    }
  }

  // Get unique SPN count
  async getUniqueSPNCount(pgn = null) {
    try {
      const params = pgn ? { pgn } : {};
      const response = await this.axios.get('/api/j1939/unique-spn-count/', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting unique SPN count:', error);
      throw error;
    }
  }

  // Get PGN summary with SPNs
  async getPGNSummary() {
    try {
      const response = await this.axios.get('/api/j1939/pgn-summary/');
      return response.data;
    } catch (error) {
      console.error('Error getting PGN summary:', error);
      throw error;
    }
  }

  // Get all parameter definitions
  async getParameterDefinitions() {
    try {
      const response = await this.axios.get('/api/j1939/parameter-definitions/');
      return response.data;
    } catch (error) {
      console.error('Error getting parameter definitions:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const j1939Service = new J1939Service();
export { API_BASE };