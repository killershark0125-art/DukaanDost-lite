import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <img src="/DukaanDost-nav.png" alt="DukaanDost" className="navbar-logo" />
        </Link>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <div className="navbar-nav">
            {user?.role !== 'seller' && (
              <Link to="/cart" onClick={closeMenu}>
                Cart ({totalItems})
              </Link>
            )}
            {user?.role === 'seller' && (
              <Link to="/seller" onClick={closeMenu}>
                Dashboard
              </Link>
            )}
            {user?.role === 'customer' && (
              <Link to="/my-orders" onClick={closeMenu}>
                My Orders
              </Link>
            )}
          </div>

          <div className="navbar-auth">
            {user ? (
              <>
                <span>Hi, {user.name}</span>
                <button className="btn btn-outline" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn" onClick={closeMenu}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;