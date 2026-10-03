import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Turn any axios error into a friendly message
const getErrorMessage = (error, fallback) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') {
    return 'Server is taking too long to respond. Please try again.';
  }
  if (!error.response) {
    return 'Cannot reach the server. Please check your internet and try again.';
  }
  return fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // ===== Load user from localStorage ONCE =====
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Verify token in background (non-blocking)
        api
          .get('/auth/verify')
          .then(({ data }) => {
            if (data.valid && data.user) {
              const freshUser = { ...parsedUser, ...data.user };
              setUser(freshUser);
              localStorage.setItem('userInfo', JSON.stringify(freshUser));
            }
          })
          .catch((err) => {
            if (err.response?.status === 401) {
              localStorage.removeItem('userInfo');
              setUser(null);
            }
          });
      }
    } catch (error) {
      console.error('AuthContext load error:', error);
      localStorage.removeItem('userInfo');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  // ===== SEND OTP =====
  // Returns: { success, data, message }
  const sendOtp = async (identifier) => {
    try {
      const { data } = await api.post(
        '/auth/send-otp',
        { identifier },
        { timeout: 60000 } // allow for Render cold start
      );
      return { success: true, data };
    } catch (error) {
      console.error('sendOtp error:', error);
      return {
        success: false,
        message: getErrorMessage(error, 'Failed to send OTP'),
      };
    }
  };

  // ===== VERIFY OTP =====
  // Existing user -> logs in automatically.
  // New user -> returns isNewUser: true so the app can go to /register.
  const verifyOtp = async (identifier, otp) => {
    try {
      const { data } = await api.post(
        '/auth/verify-otp',
        { identifier, otp },
        { timeout: 60000 }
      );

      if (data.success && !data.isNewUser && data.user) {
        login(data.user);
      }

      return { success: true, data };
    } catch (error) {
      console.error('verifyOtp error:', error);
      return {
        success: false,
        message: getErrorMessage(error, 'Invalid OTP'),
      };
    }
  };

  // ===== REGISTER AFTER OTP =====
  const registerWithOtp = async ({ identifier, type, name, password }) => {
    try {
      const { data } = await api.post(
        '/auth/register-otp',
        { identifier, type, name, password },
        { timeout: 60000 }
      );

      if (data.success && data.user) {
        login(data.user);
      }

      return { success: true, data };
    } catch (error) {
      console.error('registerWithOtp error:', error);
      return {
        success: false,
        message: getErrorMessage(error, 'Registration failed'),
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        login,
        logout,
        sendOtp,
        verifyOtp,
        registerWithOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);