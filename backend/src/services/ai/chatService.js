const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const getChatReply = async (systemPrompt, history, message) => {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message },
      ],
      temperature: 0.2,
      max_completion_tokens: 1500,
      reasoning_effort: 'low',
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Groq responded with ${response.status}: ${details}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;

  if (!reply || !reply.trim()) {
    throw new Error('Groq returned an empty reply');
  }

  return reply;
};

module.exports = { getChatReply };