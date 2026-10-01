import { useEffect, useState } from 'react';
import api from '../../api/api';

function StoreSettingsPage() {
  const [form, setForm] = useState({
    storeName: '',
    city: '',
    whatsappNumber: '',
    deliveryPolicy: '',
  });
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        const s = res.data;
        setForm({
          storeName: s.storeName,
          city: s.city,
          whatsappNumber: s.whatsappNumber,
          deliveryPolicy: s.deliveryPolicy,
        });
        setFaqs(s.faqs.map((f) => ({ question: f.question, answer: f.answer })));
      })
      .catch(() => setError('Could not load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFaqChange = (index, field, value) => {
    setFaqs(faqs.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await api.put('/settings', { ...form, faqs });
      setSuccess('Settings saved');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="container dashboard">Loading...</p>;
  }

  return (
    <div className="container dashboard">
      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>Store settings</h2>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <div className="form-group">
          <label htmlFor="storeName">Store name</label>
          <input id="storeName" name="storeName" className="input" value={form.storeName} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input id="city" name="city" className="input" value={form.city} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="whatsappNumber">WhatsApp number</label>
            <input id="whatsappNumber" name="whatsappNumber" className="input" value={form.whatsappNumber} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="deliveryPolicy">Delivery policy</label>
          <textarea id="deliveryPolicy" name="deliveryPolicy" className="input" rows={3} value={form.deliveryPolicy} onChange={handleChange} required />
        </div>

        <h3 className="faq-heading">FAQs (minimum 3)</h3>

        {faqs.map((faq, index) => (
          <div className="faq-item" key={index}>
            <input
              className="input"
              placeholder="Question"
              value={faq.question}
              onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
              required
            />
            <textarea
              className="input"
              rows={2}
              placeholder="Answer"
              value={faq.answer}
              onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
              required
            />
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removeFaq(index)}
              disabled={faqs.length <= 3}
            >
              Remove
            </button>
          </div>
        ))}

        <button type="button" className="btn btn-outline faq-add" onClick={addFaq}>
          Add FAQ
        </button>

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save settings'}
        </button>
      </form>
    </div>
  );
}

export default StoreSettingsPage;