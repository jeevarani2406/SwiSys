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
    getAllUsers: async (params = {}) => {
        const response = await apiClient.get('/accounts/admin/users/', { params });
        // Handle paginated response
        return response.data.results || response.data;
    },

    getUserById: async (userId) => {
        const response = await apiClient.get(`/accounts/admin/users/${userId}/`);
        return response.data;
    },

    approveUser: async (userId, approved = true) => {
        // Backend endpoint: POST /accounts/admin/approve-employee/<user_id>/
        const response = await apiClient.post(`/accounts/admin/approve-employee/${userId}/`, {
            approved
        });
        return response.data;
    },

    getEmployees: async (params = {}) => {
        const response = await apiClient.get('/accounts/admin/employees/', { params });
        return response.data.results || response.data;
    },

    getCustomers: async (params = {}) => {
        const response = await apiClient.get('/accounts/admin/customers/', { params });
        return response.data.results || response.data;
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

// Product service for product management operations
export const productService = {
    getAllProducts: async (params = {}) => {
        const response = await apiClient.get('/accounts/products/', { params });
        return response.data.results || response.data;
    },

    getProductById: async (productId) => {
        const response = await apiClient.get(`/accounts/products/${productId}/`);
        return response.data;
    },

    createProduct: async (productData) => {
        const response = await apiClient.post('/accounts/products/', productData);
        return response.data;
    },

    updateProduct: async (productId, productData) => {
        const response = await apiClient.put(`/accounts/products/${productId}/`, productData);
        return response.data;
    },

    deleteProduct: async (productId) => {
        const response = await apiClient.delete(`/accounts/products/${productId}/`);
        return response.data;
    }
};

// Admin service for admin dashboard operations
export const adminService = {
    getDashboardStats: async () => {
        const response = await apiClient.get('/accounts/admin/dashboard-stats/');
        return response.data.stats || response.data;
    },

    getLoginLogs: async (params = {}) => {
        const response = await apiClient.get('/accounts/admin/login-logs/', { params });
        return response.data.results || response.data;
    },

    getProductUpdateLogs: async (params = {}) => {
        const response = await apiClient.get('/accounts/admin/product-logs/', { params });
        return response.data.results || response.data;
    }
};

// Auth service for authentication operations
export const authService = {
    login: async (username, password) => {
        const response = await apiClient.post('/accounts/login/', {
            username,
            password
        });
        return response.data;
    },

    registerEmployee: async (userData) => {
        const response = await apiClient.post('/accounts/register/employee/', userData);
        return response.data;
    },

    registerCustomer: async (userData) => {
        const response = await apiClient.post('/accounts/register/customer/', userData);
        return response.data;
    },

    verifyOTP: async (username, code) => {
        const response = await apiClient.post('/accounts/verify/customer/otp/', {
            username,
            code
        });
        return response.data;
    },

    resendOTP: async (username) => {
        const response = await apiClient.post('/accounts/resend/customer/otp/', {
            username
        });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/accounts/me/');
        return response.data;
    }
};

export default apiClient;
