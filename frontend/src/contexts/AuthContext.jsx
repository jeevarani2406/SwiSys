'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authUtils } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing auth on mount
        const token = authUtils.getToken();
        const savedUser = authUtils.getUser();

        if (token && savedUser) {
            setUser(savedUser);
        }
        setLoading(false);
    }, []);

    const login = (token, userData) => {
        authUtils.setToken(token);
        authUtils.setUser(userData);
        setUser(userData);
    };

    const logout = () => {
        authUtils.clearAuth();
        setUser(null);
    };

    const isAuthenticated = () => {
        return !!user && !!authUtils.getToken();
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
