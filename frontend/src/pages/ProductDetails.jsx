import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import api from '../api/api';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);

  

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

    useEffect(() => {
    api
      .get(`/products/${id}/reviews`)
      .then((res) => setReviews(res.data))
      .catch(() => {});
  }, [id]);

  const handleReviewAdded = (review) => {
    setReviews([review, ...reviews]);
    api.get(`/products/${id}`).then((res) => setProduct(res.data));
  };

  if (loading) {
    return <p className="container section">Loading...</p>;
  }

  if (error || !product) {
    return (
      <div className="container section">
        <p className="error-text">{error || 'Product not found'}</p>
        <Link to="/">Back to store</Link>
      </div>
    );
  }

  const outOfStock = product.stock === 0;

  return (
    <div className="container section">
      <Link to="/" className="back-link">
        &larr; Back to store
      </Link>

      <div className="details-layout">
        <div>
          <img src={product.images[selectedImage]} alt={product.title} className="details-img" />
          {product.images.length > 1 && (
            <div className="thumbs">
              {product.images.map((img, i) => (
                <img
                  key={img}
                  src={img}
                  alt=""
                  className={`thumb ${i === selectedImage ? 'thumb-active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="details-info">
          <span className="badge">{product.category}</span>
          <h1>{product.title}</h1>
          <p className="details-price">Rs. {product.price.toLocaleString()}</p>
          <p className={outOfStock ? 'stock-out' : 'stock-in'}>
            {outOfStock ? 'Out of stock' : `In stock (${product.stock} available)`}
          </p>
          <p className="details-desc">{product.description}</p>
          <p className="details-rating">
            {product.averageRating > 0
              ? `Rating: ${product.averageRating} / 5 (${reviews.length} review${reviews.length === 1 ? '' : 's'})`
              : 'No ratings yet'}
          </p>
            {user?.role !== 'seller' && (
            <button className="btn" onClick={handleAdd} disabled={outOfStock}>
              {outOfStock ? 'Out of stock' : added ? 'Added to cart' : 'Add to cart'}
            </button>
          )}
        </div>
      </div>

      <div className="reviews-section">
        <h2>Reviews ({reviews.length})</h2>

        {user?.role === 'customer' && <ReviewForm productId={id} onSubmitted={handleReviewAdded} />}
        {!user && (
          <p className="review-hint">
            <Link to="/login">Log in</Link> to write a review. Only customers with a delivered order can review.
          </p>
        )}

        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}

export default ProductDetails;