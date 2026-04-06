import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const showToast = (message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  };

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const normalizeCart = (data) => ({
    ...data,
    items: [...(data.items || [])].sort((a, b) => a.id - b.id),
  });

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/api/cart');
      setCart(normalizeCart(data));
    } catch {
      // silently fail
    }
  };

  const addToCart = async (productId, quantity = 1, productName = '') => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/cart', { productId, quantity });
      setCart(normalizeCart(data));
      if (productName) showToast(`${productName} added to cart`);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add to cart' };
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/api/cart/${itemId}`, { quantity });
      setCart(normalizeCart(data));
    } catch {
      // silently fail
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await api.delete(`/api/cart/${itemId}`);
      setCart(normalizeCart(data));
    } catch {
      // silently fail
    }
  };

  const clearCart = () => setCart((prev) => (prev ? { ...prev, items: [] } : prev));

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQty, removeFromCart, clearCart, itemCount, fetchCart, toast }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
