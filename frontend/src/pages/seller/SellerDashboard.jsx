import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

function SellerDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get('/reviews/stats')
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="container dashboard">
      <h2>Seller Dashboard</h2>

      <div className="dashboard-grid">
        <Link to="/seller/products" className="card dashboard-tile">
          <h3>Products</h3>
          <p>Add, edit and delete products</p>
        </Link>
        <Link to="/seller/settings" className="card dashboard-tile">
          <h3>Store Settings</h3>
          <p>Store info, delivery policy and FAQs</p>
        </Link>
        <Link to="/seller/orders" className="card dashboard-tile">
          <h3>Orders</h3>
          <p>View orders and update their status</p>
        </Link>
      </div>

      <h3 className="stats-heading">Review sentiment</h3>
      {stats && (
        <div className="stats-grid">
          <div className="card stat-card sentiment-positive">
            <span className="stat-number">{stats.positive}</span>
            <span>Positive</span>
          </div>
          <div className="card stat-card sentiment-neutral">
            <span className="stat-number">{stats.neutral}</span>
            <span>Neutral</span>
          </div>
          <div className="card stat-card sentiment-negative">
            <span className="stat-number">{stats.negative}</span>
            <span>Negative</span>
          </div>
        </div>
      )}
      {stats?.unanalyzed > 0 && (
        <p className="review-hint">{stats.unanalyzed} review(s) could not be analyzed.</p>
      )}
    </div>
  );
}

export default SellerDashboard;