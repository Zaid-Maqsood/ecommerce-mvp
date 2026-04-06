import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const SHIPPING_COST = 5;

export default function Cart() {
  const { cart, updateQty, removeFromCart } = useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal + SHIPPING_COST;

  if (items.length === 0) {
    return (
      <main className="page">
        <h1 className="page-title">Your Cart</h1>
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <p>Your cart is empty</p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-flex', marginTop: '20px' }}>
            Browse Products
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="page">
      <motion.h1
        className="page-title"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: '28px' }}
      >
        Your Cart
      </motion.h1>

      <div className="cart-layout">
        <div className="cart-items">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                className="cart-item"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0, padding: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {item.product.image ? (
                  <img src={item.product.image} alt={item.product.name} className="cart-item-img" />
                ) : (
                  <div className="cart-item-img-placeholder" />
                )}
                <div className="cart-item-info">
                  <Link to={`/products/${item.product.id}`} className="cart-item-name">{item.product.name}</Link>
                  <p className="cart-item-price">${item.product.price.toFixed(2)} each</p>
                </div>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1} style={{ cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer' }}>−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)} style={{ cursor: 'pointer' }}>+</button>
                </div>
                <div className="cart-item-subtotal">${(item.product.price * item.quantity).toFixed(2)}</div>
                <button className="btn-remove" onClick={() => removeFromCart(item.id)} aria-label="Remove item" style={{ cursor: 'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          className="cart-summary"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <h2 className="summary-title">Order Summary</h2>
          <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>${SHIPPING_COST.toFixed(2)}</span></div>
          <div className="summary-divider" />
          <div className="summary-row summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <motion.button
            className="btn-primary btn-full"
            onClick={() => navigate('/checkout')}
            whileTap={{ scale: 0.98 }}
            style={{ cursor: 'pointer', marginTop: '20px' }}
          >
            Proceed to Checkout
          </motion.button>
          <Link to="/" className="continue-shopping">← Continue Shopping</Link>
        </motion.div>
      </div>
    </main>
  );
}
