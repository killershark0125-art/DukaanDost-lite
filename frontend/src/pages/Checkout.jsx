import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const phoneRegex = /^03\d{9}$/;

function Checkout() {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (items.length === 0 && !orderPlaced) {
    return <Navigate to="/cart" replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phoneRegex.test(form.phone)) {
      setError('Phone must be in format 03XXXXXXXXX (11 digits)');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/orders', {
        items: items.map((i) => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: form,
      });
      navigate('/my-orders', { state: { placed: true } });
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container section">
      <h2>Checkout</h2>

      <div className="checkout-layout">
        <form className="card" onSubmit={handleSubmit}>
          <h3 className="checkout-heading">Delivery details</h3>

          {error && <p className="error-text">{error}</p>}

          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" className="input" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              className="input"
              placeholder="03XXXXXXXXX"
              maxLength={11}
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input id="city" name="city" className="input" value={form.city} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="address">Full address</label>
            <textarea id="address" name="address" className="input" rows={3} value={form.address} onChange={handleChange} required />
          </div>

          <p className="checkout-payment">Payment method: Cash on Delivery</p>

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
        </form>

        <div className="card checkout-summary">
          <h3 className="checkout-heading">Order summary</h3>
          {items.map((i) => (
            <div className="summary-row" key={i._id}>
              <span>
                {i.title} x {i.quantity}
              </span>
              <span>Rs. {(i.price * i.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>Rs. {totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;