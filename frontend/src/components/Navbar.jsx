import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/">
          <img src="/DukaanDost-nav.png" alt="DukaanDost" className="navbar-logo" />
        </Link>

        <div className="navbar-links">
          {user?.role === 'seller' && <Link to="/seller">Dashboard</Link>}
          {user?.role === 'customer' && <Link to="/my-orders">My Orders</Link>}

          {user ? (
            <>
              <span>Hi, {user.name}</span>
              <button className="btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;