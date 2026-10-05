import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);

  useEffect(() => {
    api
      .get('/reviews/stats')
      .then((res) => setStats(res.data))
      .catch(() => {});

    api
      .get('/orders/stats')
      .then((res) => setOrderStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="container dashboard">
      <h2>Seller Dashboard</h2>

      {orderStats && (
        <>
          <h3 className="stats-heading">Store overview</h3>
          <div className="stats-grid">
            <div className="card stat-card">
              <span className="stat-number">Rs. {orderStats.totalSales.toLocaleString()}</span>
              <span>Total sales</span>
            </div>
            <div className="card stat-card">
              <span className="stat-number">{orderStats.totalOrders}</span>
              <span>Total orders</span>
            </div>
            <div className="card stat-card">
              <span className="stat-number">{orderStats.pendingOrders}</span>
              <span>Pending orders</span>
            </div>
          </div>
          <p className="review-hint">Total sales excludes cancelled orders.</p>
        </>
      )}

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