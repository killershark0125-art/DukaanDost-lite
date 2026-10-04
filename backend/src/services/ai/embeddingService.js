const getEmbeddings = async (texts) => {
  const model =
    process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2';
  const url = `https://router.huggingface.co/hf-inference/models/${model}/pipeline/feature-extraction`;

  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: texts.map((t) => t.slice(0, 1000)) }),
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
    const valid =
      Array.isArray(data) &&
      data.length === texts.length &&
      data.every((vector) => Array.isArray(vector) && typeof vector[0] === 'number');

    if (!valid) {
      throw new Error('Unexpected embedding response format');
    }
    return data;
  }

  throw new Error('Hugging Face embedding model is not available');
};

module.exports = { getEmbeddings };