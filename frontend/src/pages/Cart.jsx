import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="container section">
        <h2>Your cart</h2>
        <p>Your cart is empty.</p>
        <Link to="/" className="btn cart-empty-btn">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h2>Your cart</h2>

      <div className="cart-list">
        {items.map((item) => (
          <div className="card cart-item" key={item._id}>
            <img src={item.image} alt={item.title} className="cart-img" />

            <div className="cart-info">
              <Link to={`/products/${item._id}`}>
                <h3>{item.title}</h3>
              </Link>
              <p className="product-price">Rs. {item.price.toLocaleString()}</p>
            </div>

            <div className="qty">
              <button className="qty-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                -
              </button>
              <span>{item.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
              >
                +
              </button>
            </div>

            <p className="cart-line-total">Rs. {(item.price * item.quantity).toLocaleString()}</p>

            <button className="btn btn-danger" onClick={() => removeFromCart(item._id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="card cart-summary">
        <h3>Total: Rs. {totalPrice.toLocaleString()}</h3>
        <p>Payment: Cash on Delivery</p>
        <Link to="/checkout" className="btn">
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}

export default Cart;