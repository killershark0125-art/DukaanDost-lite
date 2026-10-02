const { buildSystemPrompt } = require('../services/ai/promptBuilder');
const { getChatReply } = require('../services/ai/chatService');

const chat = async (req, res) => {
  const { message, history } = req.body;

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'Message is required' });
  }
  if (message.length > 500) {
    return res.status(400).json({ message: 'Message is too long (max 500 characters)' });
  }

  const cleanHistory = Array.isArray(history)
    ? history
        .filter(
          (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
        )
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }))
    : [];

  try {
    const systemPrompt = await buildSystemPrompt();
    const reply = await getChatReply(systemPrompt, cleanHistory, message.trim());
    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(502).json({
      message:
        'Sorry, the assistant is unavailable right now. Please try again in a moment or contact the store on WhatsApp.',
    });
  }
};

module.exports = { chat };