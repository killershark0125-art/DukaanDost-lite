import { useState } from 'react';
import api from '../api/api';

function ReviewForm({ productId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/reviews', { productId, rating, text });
      onSubmitted(res.data);
      setRating(0);
      setText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card review-form" onSubmit={handleSubmit}>
      <h3>Write a review</h3>

      {error && <p className="error-text">{error}</p>}

      <div className="star-input">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            className={`star-btn ${n <= rating ? 'star-active' : ''}`}
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>

      <div className="form-group">
        <textarea
          className="input"
          rows={3}
          placeholder="Share your experience with this product"
          maxLength={1000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </div>

      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  );
}

export default ReviewForm;