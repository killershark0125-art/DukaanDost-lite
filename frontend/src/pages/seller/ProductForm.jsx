import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';

const emptyForm = {
  title: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  images: '',
};

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/products/${id}`)
      .then((res) => {
        const p = res.data;
        setForm({
          title: p.title,
          description: p.description,
          price: p.price,
          stock: p.stock,
          category: p.category,
          images: p.images.join('\n'),
        });
      })
      .catch(() => setError('Could not load product'));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      images: form.images
        .split('\n')
        .map((url) => url.trim())
        .filter(Boolean),
    };

    try {
      if (id) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      navigate('/seller/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container dashboard">
      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>{id ? 'Edit product' : 'Add product'}</h2>

        {error && <p className="error-text">{error}</p>}

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" className="input" value={form.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" className="input" rows={4} value={form.description} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price (Rs.)</label>
            <input id="price" name="price" type="number" min="1" className="input" value={form.price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input id="stock" name="stock" type="number" min="0" className="input" value={form.stock} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input id="category" name="category" className="input" placeholder="e.g. Kurta" value={form.category} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="images">Image URLs (one per line)</label>
          <textarea id="images" name="images" className="input" rows={3} placeholder="https://..." value={form.images} onChange={handleChange} required />
        </div>

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save product'}
        </button>
      </form>
    </div>
  );
}

export default ProductForm;