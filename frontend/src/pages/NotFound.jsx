import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container section">
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn not-found-btn">
        Back to store
      </Link>
    </div>
  );
}

export default NotFound;