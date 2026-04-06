import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const SHIPPING_COST = 5;
const LOYALTY_PER_ORDER = 10;

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user, updateLoyaltyPoints } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = subtotal + SHIPPING_COST;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.address || !form.city || !form.phone) {
      return setError('All fields are required');
    }
    setLoading(true);
    try {
      const address = `${form.name}, ${form.address}, ${form.city} — Phone: ${form.phone}`;
      const { data } = await api.post('/api/orders', { address });
      clearCart();
      updateLoyaltyPoints((user.loyaltyPoints || 0) + LOYALTY_PER_ORDER);
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="page">
        <div className="success-card">
          <div className="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
          </div>
          <h2 className="success-title">Order Placed!</h2>
          <p className="success-msg">{success}</p>
          <p className="success-points">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            You now have {(user?.loyaltyPoints || 0)} loyalty points
          </p>
          <div className="success-actions">
            <Link to="/orders" className="btn-primary">View My Orders</Link>
            <Link to="/" className="btn-secondary">Continue Shopping</Link>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="page">
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>Shop Now</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form">
          <h2 className="form-section-title">Shipping Address</h2>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" placeholder="John Doe" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label htmlFor="address">Street Address</label>
            <input id="address" type="text" placeholder="123 Main Street" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input id="city" type="text" placeholder="New York" value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" type="tel" placeholder="+1 555-0000" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
          </div>

          <div className="cod-notice">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            Cash on Delivery (COD) — Pay when your order arrives
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading} style={{ cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Placing Order…' : `Place Order — $${total.toFixed(2)}`}
          </button>
        </form>

        <div className="checkout-summary">
          <h2 className="summary-title">Order Summary</h2>
          {items.map((item) => (
            <div key={item.id} className="summary-item">
              <span className="summary-item-name">{item.product.name} × {item.quantity}</span>
              <span>${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-divider" />
          <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>${SHIPPING_COST.toFixed(2)}</span></div>
          <div className="summary-divider" />
          <div className="summary-row summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <div className="loyalty-earn-notice">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            You'll earn {LOYALTY_PER_ORDER} loyalty points with this order
          </div>
        </div>
      </div>
    </main>
  );
}
