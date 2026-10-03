import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <p className="footer-brand">DukaanDost Lite</p>
            <p className="footer-note">Bazaar ki raunaq, ab aapke ghar tak.</p>
          </div>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/cart">Cart</Link>
          </div>
        </div>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} DukaanDost Lite. Cash on Delivery across Pakistan.
        </p>
      </div>
    </footer>
  );
}

export default Footer;