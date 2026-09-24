import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== Request Interceptor (Token attach karo) =====
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        localStorage.removeItem('userInfo');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Response Interceptor (Auto-logout on 401) =====
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expire ya invalid
      console.log('🔒 Token expired or invalid. Logging out...');
      localStorage.removeItem('userInfo');

      // Login/Register page pe nahi hai toh redirect karo
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;