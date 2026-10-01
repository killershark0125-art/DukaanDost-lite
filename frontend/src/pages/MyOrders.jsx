import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/api';

function MyOrders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/orders/my')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load your orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    setError('');
    try {
      const res = await api.patch(`/orders/${id}/cancel`);
      setOrders(orders.map((o) => (o._id === id ? res.data : o)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel the order');
    }
  };

  return (
    <div className="container section">
      <h2>My orders</h2>

      {location.state?.placed && <p className="success-text">Order placed successfully. Thank you!</p>}
      {error && <p className="error-text">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && orders.length === 0 && <p>You have no orders yet.</p>}

      <div className="order-list">
        {orders.map((order) => (
          <div className="card order-card" key={order._id}>
            <div className="order-head">
              <div>
                <h3>{order.orderNumber}</h3>
                <p className="order-date">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span>
            </div>

            <ul className="order-items">
              {order.items.map((item) => (
                <li key={item._id}>
                  <span>
                    {item.title} x {item.quantity}
                  </span>
                  <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>

            <p className="order-address">
              Deliver to: {order.shippingAddress.name}, {order.shippingAddress.address},{' '}
              {order.shippingAddress.city} ({order.shippingAddress.phone})
            </p>

            <div className="order-foot">
              <strong>Total: Rs. {order.totalAmount.toLocaleString()}</strong>
              {order.status === 'Pending' && (
                <button className="btn btn-danger" onClick={() => handleCancel(order._id)}>
                  Cancel order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyOrders;