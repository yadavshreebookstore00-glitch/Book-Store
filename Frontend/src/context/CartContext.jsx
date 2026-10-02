import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(true);

  // Track the last fetched user ID
  const lastFetchedUserRef = useRef(null);
  const isFetchingRef = useRef(false);
  // Track in-flight add-to-cart calls to block duplicates
  const addingRef = useRef(new Set());

  // ============================================================
  // ✅ FETCH CART
  // ============================================================
  const fetchCart = useCallback(async () => {
    if (!user || user.isAdmin) {
      console.log('👤 CartContext: No user or admin, clearing cart');
      setCart({ items: [], totalPrice: 0 });
      setLoading(false);
      return;
    }

    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      console.log('⏳ CartContext: Already fetching, skipping');
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      console.log('🔄 CartContext: Fetching cart for', user.name);

      const { data } = await api.get('/cart');
      console.log('✅ CartContext: Cart fetched:', data?.items?.length || 0, 'items');

      setCart({
        items: Array.isArray(data?.items) ? data.items : [],
        totalPrice: data?.totalPrice || 0,
      });

      lastFetchedUserRef.current = user._id;
    } catch (err) {
      console.error('❌ CartContext: Fetch error:', err);
      setCart({ items: [], totalPrice: 0 });
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user]);

  // ============================================================
  // ✅ FETCH CART WHEN USER IS READY
  // ============================================================
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('⏳ CartContext: Waiting for auth...');
      return;
    }

    // No user → clear cart
    if (!user) {
      console.log('👤 CartContext: No user, resetting');
      setCart({ items: [], totalPrice: 0 });
      setLoading(false);
      lastFetchedUserRef.current = null;
      return;
    }

    // Admin → skip
    if (user.isAdmin) {
      setCart({ items: [], totalPrice: 0 });
      setLoading(false);
      return;
    }

    // User changed → fetch new cart
    if (lastFetchedUserRef.current !== user._id) {
      console.log('🆕 CartContext: New user, fetching cart');
      fetchCart();
    }
  }, [user?._id, authLoading, user, fetchCart]);

  // ============================================================
  // ✅ ADD TO CART
  // ============================================================
  const addToCart = async (bookId, quantity = 1) => {
    if (!user) return { success: false, message: 'Please login first' };

    // Block duplicate calls (double click / effect running twice)
    if (addingRef.current.has(bookId)) {
      return { success: false, message: 'Already adding', duplicate: true };
    }
    addingRef.current.add(bookId);

    try {
      const { data } = await api.post('/cart', { bookId, quantity });

      setCart({
        items: Array.isArray(data?.items) ? data.items : [],
        totalPrice: data?.totalPrice || 0,
      });

      lastFetchedUserRef.current = user._id;
      return { success: true };
    } catch (err) {
      console.error('❌ CartContext: Add error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to add to cart',
      };
    } finally {
      // keep the lock for a moment so rapid repeat calls are ignored
      setTimeout(() => addingRef.current.delete(bookId), 1000);
    }
  };

  // ============================================================
  // ✅ UPDATE QUANTITY
  // ============================================================
  const updateQuantity = async (bookId, quantity) => {
    if (!user) return;

    const prevCart = { ...cart };

    // Optimistic update
    setCart((prev) => {
      const updatedItems = prev.items.map((item) => {
        const itemBookId = item.book?._id || item.book;
        return itemBookId === bookId ? { ...item, quantity } : item;
      });
      const newTotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return { items: updatedItems, totalPrice: newTotal };
    });

    try {
      const { data } = await api.put(`/cart/${bookId}`, { quantity });
      setCart({
        items: Array.isArray(data?.items) ? data.items : [],
        totalPrice: data?.totalPrice || 0,
      });
    } catch (err) {
      console.error('❌ Update quantity error:', err);
      setCart(prevCart);
    }
  };

  // ============================================================
  // ✅ REMOVE FROM CART
  // ============================================================
  const removeFromCart = async (bookId) => {
    if (!user) return;

    const prevCart = { ...cart };

    setCart((prev) => {
      const updatedItems = prev.items.filter((item) => {
        const itemBookId = item.book?._id || item.book;
        return itemBookId !== bookId;
      });
      const newTotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return { items: updatedItems, totalPrice: newTotal };
    });

    try {
      const { data } = await api.delete(`/cart/${bookId}`);
      setCart({
        items: Array.isArray(data?.items) ? data.items : [],
        totalPrice: data?.totalPrice || 0,
      });
    } catch (err) {
      console.error('❌ Remove error:', err);
      setCart(prevCart);
    }
  };

  // ============================================================
  // ✅ CLEAR CART
  // ============================================================
  const clearCart = async () => {
    if (!user) return;
    try {
      await api.delete('/cart');
      setCart({ items: [], totalPrice: 0 });
    } catch (err) {
      console.error('❌ Clear error:', err);
    }
  };

  // ============================================================
  // ✅ REFRESH CART
  // ============================================================
  const refreshCart = useCallback(() => {
    fetchCart();
  }, [fetchCart]);

  // ============================================================
  // ✅ CART COUNT
  // ============================================================
  const cartCount = (cart?.items || []).reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

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
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};