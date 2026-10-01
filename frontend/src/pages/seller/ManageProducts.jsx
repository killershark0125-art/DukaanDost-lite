import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(res.data))
      .catch(() => setError('Could not load products'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="container dashboard">
      <div className="page-header">
        <h2>Products</h2>
        <Link to="/seller/products/new" className="btn">
          Add product
        </Link>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && products.length === 0 && <p>No products yet. Add your first one.</p>}

      {products.length > 0 && (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <img src={p.images[0]} alt={p.title} className="table-img" />
                  </td>
                  <td>{p.title}</td>
                  <td>{p.category}</td>
                  <td>Rs. {p.price}</td>
                  <td>{p.stock}</td>
                  <td className="table-actions">
                    <Link to={`/seller/products/${p._id}/edit`} className="btn btn-outline">
                      Edit
                    </Link>
                    <button className="btn btn-danger" onClick={() => handleDelete(p._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageProducts;