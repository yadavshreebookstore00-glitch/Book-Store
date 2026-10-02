import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from 'react';
import api from '../services/api';

const AuthContext = createContext();

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
        console.log('✅ AuthContext: User loaded from localStorage:', parsedUser?.name);
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
              console.log('🔒 AuthContext: Token expired');
              localStorage.removeItem('userInfo');
              setUser(null);
            }
          });
      } else {
        console.log('👤 AuthContext: No user in localStorage');
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);