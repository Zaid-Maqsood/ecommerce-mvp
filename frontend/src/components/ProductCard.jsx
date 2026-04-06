import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      setFeedback('Login to add to cart');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    const result = await addToCart(product.id, 1, product.name);
    setFeedback(result.success ? 'Added!' : result.message);
    setTimeout(() => setFeedback(''), 2000);
  };

  const outOfStock = product.stock === 0;

  return (
    <motion.div
      className={`product-card ${outOfStock ? 'out-of-stock' : ''}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-image-wrap">
          {product.image ? (
            <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
          ) : (
            <div className="product-image-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
          )}
          {outOfStock && <div className="out-of-stock-overlay">Out of Stock</div>}
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-desc">
            {product.description.slice(0, 72)}{product.description.length > 72 ? '…' : ''}
          </p>
          <div className="product-meta">
            <span className="product-price">${product.price.toFixed(2)}</span>
            {!outOfStock && <span className="stock-badge">{product.stock} in stock</span>}
          </div>
        </div>
      </Link>

      <motion.button
        className={`btn-add-cart ${outOfStock ? 'disabled' : ''}`}
        onClick={handleAddToCart}
        disabled={outOfStock || loading}
        whileTap={!outOfStock ? { scale: 0.97 } : {}}
        style={{ cursor: outOfStock ? 'not-allowed' : 'pointer' }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={feedback || 'default'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {feedback || (outOfStock ? 'Out of Stock' : 'Add to Cart')}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
