import { useEffect, useState } from 'react';
import api from '../api/api';
import ProductCard from '../components/ProductCard';
import Landing from '../components/landing';

const toWhatsappLink = (number) => {
  const digits = number.replace(/\D/g, '');
  const international = digits.startsWith('0') ? `92${digits.slice(1)}` : digits;
  return `https://wa.me/${international}`;
};

function Home() {
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => setSettings(res.data))
      .catch(() => setError('Could not load store information'));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/products', { params: category ? { category } : {} })
      .then((res) => {
        setProducts(res.data);
        if (!category) {
          setCategories([...new Set(res.data.map((p) => p.category))]);
        }
      })
      .catch(() => setError('Could not load products'))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <>
      <Landing />
      {settings && (
        <section className="hero">
          <div className="container">
            <h1>{settings.storeName}</h1>
            <p className="hero-city">{settings.city}</p>
            <p className="hero-policy">{settings.deliveryPolicy}</p>
            <a
              href={toWhatsappLink(settings.whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-light"
            >
              Chat on WhatsApp
            </a>
          </div>
        </section>
      )}

      <div className="container section">
        {error && <p className="error-text">{error}</p>}

        <h2>Our products</h2>

        <div className="filter-bar">
          <button
            className={`chip ${category === '' ? 'chip-active' : ''}`}
            onClick={() => setCategory('')}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? 'chip-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && <p>Loading...</p>}
        {!loading && products.length === 0 && <p>No products found.</p>}

        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>

      {settings && (
        <div className="container section">
          <h2>Frequently asked questions</h2>
          <div className="faq-list">
            {settings.faqs.map((f) => (
              <details className="card faq-detail" key={f._id}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Home;