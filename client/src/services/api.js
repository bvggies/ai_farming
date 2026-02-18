/**
 * Central API client for talking to the backend server.
 * All HTTP requests (login, posts, AI chat, etc.) go through this axios instance.
 * It automatically adds the auth token to requests and handles 401 (logout).
 */
import axios from 'axios';

// Backend URL: from environment variable in production, or localhost when developing
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create one shared axios instance with default base URL and JSON header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Before every request: attach the stored JWT so the server knows who we are
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for multipart/form-data, let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: run after every response. If server says "unauthorized" (401), clear token and send user to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

