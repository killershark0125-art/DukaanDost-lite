import { useEffect, useState } from 'react';
import api from '../../api/api';

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load orders'))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (id, status) => {
    setError('');
    try {
      const res = await api.patch(`/orders/${id}/status`, { status });
      setOrders(
        orders.map((o) => (o._id === id ? { ...o, status: res.data.status } : o))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update the order');
    }
  };

  return (
    <div className="container dashboard">
      <h2>Orders</h2>

      {error && <p className="error-text">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && orders.length === 0 && <p>No orders yet.</p>}

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

            <p className="order-address">
              Customer: {order.customer?.name || 'Deleted user'}
              {order.customer?.email ? ` (${order.customer.email})` : ''}
            </p>

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

              <div className="order-actions">
                {order.status === 'Pending' && (
                  <>
                    <button className="btn" onClick={() => changeStatus(order._id, 'Confirmed')}>
                      Confirm
                    </button>
                    <button className="btn btn-danger" onClick={() => changeStatus(order._id, 'Cancelled')}>
                      Cancel
                    </button>
                  </>
                )}
                {order.status === 'Confirmed' && (
                  <button className="btn" onClick={() => changeStatus(order._id, 'Delivered')}>
                    Mark as delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SellerOrders;