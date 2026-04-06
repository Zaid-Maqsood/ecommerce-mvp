import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          Widget<span>-ly</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>
            Products
          </Link>
          {user?.role !== 'admin' && user && (
            <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'nav-link-active' : ''}`}>
              My Orders
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link nav-link-admin">
              Admin
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          {user?.role !== 'admin' && user && (
            <div className="loyalty-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {user.loyaltyPoints} pts
            </div>
          )}

          {user ? (
            <>
              <Link to="/cart" className="cart-btn" aria-label="Shopping cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="cart-badge"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Link>
              <span className="nav-user">{user.email.split('@')[0]}</span>
              <button onClick={handleLogout} className="btn-logout" style={{ cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-nav-login">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
