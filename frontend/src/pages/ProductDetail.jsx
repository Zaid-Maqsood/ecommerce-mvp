import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, loading } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    api.get(`/api/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setError('Product not found'))
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      setFeedback('Please login to add items to cart');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }
    const result = await addToCart(product.id, quantity, product.name);
    setFeedback(result.success ? `Added ${quantity} item(s) to cart!` : result.message);
    setTimeout(() => setFeedback(''), 3000);
  };

  if (pageLoading) return <div className="page"><div className="loading-text">Loading…</div></div>;
  if (error || !product) return (
    <div className="page">
      <div className="alert alert-error">{error || 'Product not found'}</div>
      <Link to="/" className="btn-secondary mt-16">Back to Products</Link>
    </div>
  );

  const outOfStock = product.stock === 0;

  return (
    <main className="page">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Link to="/" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Products
        </Link>

        <div className="detail-layout">
          <motion.div
            className="detail-image-wrap"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {product.image ? (
              <img src={product.image} alt={product.name} className="detail-image" />
            ) : (
              <div className="detail-image-placeholder">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
            )}
          </motion.div>

          <motion.div
            className="detail-info"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
          >
            <h1 className="detail-title">{product.name}</h1>
            <p className="detail-price">${product.price.toFixed(2)}</p>
            <p className="detail-desc">{product.description}</p>

            <div className="detail-stock">
              {outOfStock ? (
                <span className="badge badge-red">Out of Stock</span>
              ) : (
                <span className="badge badge-green">{product.stock} in stock</span>
              )}
            </div>

            {!outOfStock && (
              <div className="qty-row">
                <label>Quantity</label>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" style={{ cursor: 'pointer' }}>−</button>
                  <span className="qty-value">{quantity}</span>
                  <button className="qty-btn" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} aria-label="Increase quantity" style={{ cursor: 'pointer' }}>+</button>
                </div>
              </div>
            )}

            {feedback && (
              <motion.div
                className={`alert ${feedback.includes('Added') ? 'alert-success' : 'alert-error'}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {feedback}
              </motion.div>
            )}

            <motion.button
              className={`btn-primary btn-full ${outOfStock ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={outOfStock || loading}
              whileTap={!outOfStock ? { scale: 0.98 } : {}}
              style={{ cursor: outOfStock ? 'not-allowed' : 'pointer' }}
            >
              {outOfStock ? 'Out of Stock' : loading ? 'Adding…' : 'Add to Cart'}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
