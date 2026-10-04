const Product = require('../../models/product');
const { getEmbeddings } = require('./embeddingService');

const MIN_SCORE = 0.25;
const MAX_RESULTS = 8;

const buildProductText = (p) => `${p.title}. ${p.description}. Category: ${p.category}`;

const cosineSimilarity = (a, b) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
};

const semanticSearch = async (query) => {
  const products = await Product.find().select('+embedding +embeddingText').lean();

  const stale = products.filter(
    (p) => !p.embedding?.length || p.embeddingText !== buildProductText(p)
  );

  const vectors = await getEmbeddings([query, ...stale.map(buildProductText)]);
  const queryVector = vectors[0];

  await Promise.all(
    stale.map(async (p, i) => {
      p.embedding = vectors[i + 1];
      p.embeddingText = buildProductText(p);
      await Product.updateOne(
        { _id: p._id },
        { embedding: p.embedding, embeddingText: p.embeddingText }
      );
    })
  );

  return products
    .map((p) => ({ product: p, score: cosineSimilarity(queryVector, p.embedding) }))
    .filter((r) => r.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ product, score }) => {
      const { embedding, embeddingText, ...rest } = product;
      return { ...rest, score: Math.round(score * 100) / 100 };
    });
};

const keywordSearch = async (query) => {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);

  const products = await Product.find().lean();

  return products
    .map((p) => {
      const text = `${p.title} ${p.description} ${p.category}`.toLowerCase();
      return { ...p, score: words.filter((w) => text.includes(w)).length };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);
};

module.exports = { semanticSearch, keywordSearch };