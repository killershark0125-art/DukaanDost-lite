const normalizeLabel = (label) => {
  const l = String(label).toLowerCase();
  if (l.includes('pos') || l === 'label_2') return 'positive';
  if (l.includes('neg') || l === 'label_0') return 'negative';
  if (l.includes('neu') || l === 'label_1') return 'neutral';
  return null;
};

const analyzeSentiment = async (text) => {
  const model = process.env.HF_SENTIMENT_MODEL || 'cardiffnlp/twitter-xlm-roberta-base-sentiment';
  const url = `https://router.huggingface.co/hf-inference/models/${model}`;

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text.slice(0, 512) }),
      });

      if (response.status === 503 && attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 8000));
        continue;
      }

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Hugging Face responded with ${response.status}: ${details}`);
      }

      const data = await response.json();
      const scores = Array.isArray(data[0]) ? data[0] : data;
      const best = scores.reduce((a, b) => (b.score > a.score ? b : a));
      return normalizeLabel(best.label);
    }
    return null;
  } catch (error) {
    console.error('Sentiment error:', error.message);
    return null;
  }
};

module.exports = { analyzeSentiment };