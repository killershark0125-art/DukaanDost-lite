const sentimentLabel = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
};

function Stars({ value }) {
  return (
    <span className="stars" aria-label={`${value} out of 5`}>
      {'★'.repeat(value)}
      {'☆'.repeat(5 - value)}
    </span>
  );
}

function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return <p>No reviews yet.</p>;
  }

  return (
    <div className="review-list">
      {reviews.map((r) => (
        <div className="card review-card" key={r._id}>
          <div className="review-head">
            <div>
              <strong>{r.customer?.name || 'Customer'}</strong> <Stars value={r.rating} />
            </div>
            {r.sentiment && (
              <span className={`sentiment sentiment-${r.sentiment}`}>{sentimentLabel[r.sentiment]}</span>
            )}
          </div>
          <p dir="auto">{r.text}</p>
          <p className="review-date">{new Date(r.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}

export default ReviewList;