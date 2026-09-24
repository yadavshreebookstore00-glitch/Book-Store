import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(true);

  // ===== Fetch Cart =====
  const fetchCart = useCallback(async () => {
    if (authLoading) return;

    if (!user || user.isAdmin) {
      setCart({ items: [], totalPrice: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCart({
        items: Array.isArray(data.items) ? data.items : [],
        totalPrice: data.totalPrice || 0,
      });
    } catch (err) {
      console.error('Cart fetch error:', err);
      setCart({ items: [], totalPrice: 0 });
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ===== Add to Cart =====
  const addToCart = async (bookId, quantity = 1) => {
    if (!user) return { success: false, message: 'Please login first' };

    try {
      const { data } = await api.post('/cart', { bookId, quantity });
      setCart({
        items: Array.isArray(data.items) ? data.items : [],
        totalPrice: data.totalPrice || 0,
      });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to add to cart',
      };
    }
  };

  // ===== Update Quantity =====
  const updateQuantity = async (bookId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${bookId}`, { quantity });
      setCart({
        items: Array.isArray(data.items) ? data.items : [],
        totalPrice: data.totalPrice || 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ===== Remove from Cart =====
  const removeFromCart = async (bookId) => {
    try {
      const { data } = await api.delete(`/cart/${bookId}`);
      setCart({
        items: Array.isArray(data.items) ? data.items : [],
        totalPrice: data.totalPrice || 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ===== Clear Cart =====
  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart({ items: [], totalPrice: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  // ===== Cart count =====
  const cartCount = cart.items?.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  ) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);