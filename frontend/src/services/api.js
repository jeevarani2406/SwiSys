import axios from 'axios';

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Token ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth utility functions
export const authUtils = {
    setToken: (token) => {
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('authToken', token);
            } else {
                localStorage.removeItem('authToken');
            }
        }
    },

    getToken: () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken');
        }
        return null;
    },

    setUser: (user) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
    },

    getUser: () => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        }
        return null;
    },

    clearAuth: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
    },

    isAuthenticated: () => {
        return !!authUtils.getToken();
    }
};

// User service for user management operations
export const userService = {
    getAllUsers: async () => {
        const response = await apiClient.get('/accounts/admin/users/');
        return response.data;
    },

    getUserById: async (userId) => {
        const response = await apiClient.get(`/accounts/admin/users/${userId}/`);
        return response.data;
    },

    approveUser: async (userId) => {
        const response = await apiClient.put(`/accounts/admin/users/${userId}/approve/`);
        return response.data;
    },

    updateUser: async (userId, userData) => {
        const response = await apiClient.put(`/accounts/admin/users/${userId}/`, userData);
        return response.data;
    },

    deleteUser: async (userId) => {
        const response = await apiClient.delete(`/accounts/admin/users/${userId}/`);
        return response.data;
    }
};

export default apiClient;
