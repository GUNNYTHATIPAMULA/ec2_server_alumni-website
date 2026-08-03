// src/services/api.js
import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

// Setup axios instance
export const api = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        let token = localStorage.getItem('token');
        if (!token) {
            const match = document.cookie.match(/(^| )token=([^;]+)/);
            if (match) token = decodeURIComponent(match[2]);
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: clear session on unauthorized (expired/invalid token)
const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=lax";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=lax";
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=lax";
    document.cookie = "fullName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=lax";
};

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearAuth();
        }
        return Promise.reject(error);
    }
);