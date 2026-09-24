import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ===== Fetch Wishlist =====
  const fetchWishlist = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Fetching wishlist...');
      const { data } = await api.get('/wishlist');
      console.log('✅ Wishlist data:', data);
      setWishlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Wishlist fetch error:', err.response?.data || err.message);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // ===== Toggle Wishlist =====
  const toggleWishlist = async (bookId) => {
    if (!user) {
      return { success: false, message: 'Please login first' };
    }

    try {
      console.log('❤️ Toggling wishlist:', bookId);
      const { data } = await api.post(`/wishlist/${bookId}`);
      console.log('✅ Toggle response:', data);

      setWishlist(Array.isArray(data.wishlist) ? data.wishlist : []);
      return { success: true, action: data.action };
    } catch (err) {
      console.error('❌ Toggle error:', err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update wishlist',
      };
    }
  };

  // ===== Remove =====
  const removeFromWishlist = async (bookId) => {
    try {
      const { data } = await api.delete(`/wishlist/${bookId}`);
      setWishlist(Array.isArray(data) ? data : []);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to remove',
      };
    }
  };

  const isInWishlist = (bookId) => {
    if (!bookId) return false;
    return wishlist.some((b) => b._id === bookId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        error,
        wishlistCount: wishlist.length,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);