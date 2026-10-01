import { Link } from 'react-router-dom';

function SellerDashboard() {
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
    </div>
  );
}

export default SellerDashboard;