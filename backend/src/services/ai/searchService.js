const Product = require('../../models/product');
const { getEmbeddings } = require('./embeddingService');
const { getChatReply } = require('./chatService');

const MIN_SCORE = 0.3;
const RELATIVE_GAP = 0.15;
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

const rewriteQuery = async (query) => {
  try {
    const categories = await Product.distinct('category');
    const prompt = `You convert a shopper's search into short English search keywords for a Pakistani online store.
The store's product categories are: ${categories.join(', ')}.
The shopper may write in English, Urdu or Roman Urdu (Urdu in English letters).
Return ONLY the English keywords, with no explanation and no quotes, at most 12 words.
Examples:
"kuch khane k liye" -> homemade food, pickle, something to eat
"shadi ke liye laal jora" -> red bridal wedding dress, festive outfit`;

    const rewritten = await getChatReply(prompt, [], query);
    const cleaned = rewritten.replace(/["\n]/g, ' ').trim().slice(0, 150);
    return cleaned || query;
  } catch (error) {
    console.error('Query rewrite failed, using the original query:', error.message);
    return query;
  }
};

const semanticSearch = async (query) => {
  const searchedAs = await rewriteQuery(query);
  const products = await Product.find().select('+embedding +embeddingText').lean();

  const stale = products.filter(
    (p) => !p.embedding?.length || p.embeddingText !== buildProductText(p)
  );

  const vectors = await getEmbeddings([searchedAs, ...stale.map(buildProductText)]);
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

  const ranked = products
    .map((p) => ({ product: p, score: cosineSimilarity(queryVector, p.embedding) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked.length ? ranked[0].score : 0;

  const results = ranked
    .filter((r) => r.score >= MIN_SCORE && r.score >= best - RELATIVE_GAP)
    .slice(0, MAX_RESULTS)
    .map(({ product, score }) => {
      const { embedding, embeddingText, ...rest } = product;
      return { ...rest, score: Math.round(score * 100) / 100 };
    });

  return { searchedAs, results };
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