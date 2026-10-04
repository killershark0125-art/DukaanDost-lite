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
  const [search, setSearch] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchMode, setSearchMode] = useState('semantic');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

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

    const handleSearch = async (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;

    setSearching(true);
    setSearchError('');
    try {
      const res = await api.get('/products/search', { params: { q } });
      setSearchResults(res.data.results);
      setSearchMode(res.data.mode);
      setSearchedQuery(q);
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearch('');
    setSearchResults(null);
    setSearchedQuery('');
    setSearchError('');
  };

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

                <form className="search-bar" onSubmit={handleSearch}>
          <input
            className="input"
            type="search"
            placeholder='Search: "shadi ke liye laal jora"'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={200}
          />
          <button className="btn" type="submit" disabled={searching || !search.trim()}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searching && (
          <p className="review-hint">Searching... the first search can take a few seconds.</p>
        )}
        {searchError && <p className="error-text">{searchError}</p>}

        {searchResults && (
          <div className="search-results">
            <div className="search-results-head">
              <h2>
                {searchResults.length} result{searchResults.length === 1 ? '' : 's'} for &ldquo;
                {searchedQuery}&rdquo;
              </h2>
              <button type="button" className="btn btn-outline" onClick={clearSearch}>
                Clear search
              </button>
            </div>

            {searchMode === 'keyword' && (
              <p className="review-hint">
                Smart search is unavailable right now, so these are keyword matches.
              </p>
            )}

            {searchResults.length === 0 ? (
              <p>No products matched your search.</p>
            ) : (
              <div className="product-grid">
                {searchResults.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}

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



        <div className="product-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <div className="skeleton-card" key={i} />)
            : products.map((p) => <ProductCard key={p._id} product={p} />)}
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