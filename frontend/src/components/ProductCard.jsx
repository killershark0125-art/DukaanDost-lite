import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  const outOfStock = product.stock === 0;

  return (
    <Link
      to={`/products/${product._id}`}
      className={`card product-card ${outOfStock ? 'product-card-soldout' : ''}`}
    >
      <img src={product.images[0]} alt={product.title} className="product-card-img" />
      <div className="product-card-body">
        <span className="badge">{product.category}</span>
        <h3>{product.title}</h3>
        <p className="product-price">Rs. {product.price.toLocaleString()}</p>
        <p className={outOfStock ? 'stock-out' : 'stock-in'}>
          {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
        </p>
      </div>
    </Link>
  );
}

export default ProductCard;