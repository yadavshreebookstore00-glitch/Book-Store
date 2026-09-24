import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========== APP LOAD = Auto-verify Token ==========
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('userInfo');

        if (!storedUser) {
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);

        // Pehle localStorage se set karo (fast UI)
        setUser(parsedUser);

        // Phir backend se verify karo (async)
        try {
          const { data } = await api.get('/auth/verify');
          if (data.valid && data.user) {
            const freshUser = { ...parsedUser, ...data.user };
            setUser(freshUser);
            localStorage.setItem('userInfo', JSON.stringify(freshUser));
          }
        } catch (error) {
          // Token invalid/expired → logout
          if (error.response?.status === 401) {
            console.log('🔒 Token expired. Logging out...');
            localStorage.removeItem('userInfo');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Init auth error:', error);
        localStorage.removeItem('userInfo');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ========== SEND OTP ==========
  const sendOtp = async (identifier) => {
    try {
      const { data } = await api.post('/auth/send-otp', { identifier });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP',
      };
    }
  };

  // ========== VERIFY OTP ==========
  const verifyOtp = async (identifier, otp) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { identifier, otp });

      if (!data.isNewUser && data.user) {
        setUser(data.user);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed',
      };
    }
  };

  // ========== REGISTER WITH OTP ==========
  const registerWithOtp = async (userData) => {
    try {
      const { data } = await api.post('/auth/register-otp', userData);
      setUser(data.user);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  // ========== LOGOUT (Manual) ==========
  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    console.log('👋 Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sendOtp,
        verifyOtp,
        registerWithOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);