import { useEffect, useRef, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, sending]);

  if (user?.role === 'seller') {
    return null;
  }

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const history = messages
      .filter((m) => !m.isError)
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setSending(true);

    try {
      const res = await api.post('/chat', { message: text, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.response?.data?.message || 'Sorry, something went wrong. Please try again.',
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <strong>Store assistant</strong>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">
              &times;
            </button>
          </div>

          <div className="chat-body">
            <div className="chat-msg chat-msg-bot">
              Hi! Ask me about our products, prices, stock or delivery. You can write in English, Urdu or Roman Urdu.
            </div>

            {messages.map((m, i) => (
              <div
                key={i}
                dir="auto"
                className={`chat-msg ${m.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'} ${m.isError ? 'chat-msg-error' : ''}`}
              >
                {m.content}
              </div>
            ))}

            {sending && <div className="chat-msg chat-msg-bot">Typing...</div>}
            <div ref={bottomRef} />
          </div>

          <form className="chat-form" onSubmit={handleSend}>
            <input
              className="input"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
            />
            <button className="btn" type="submit" disabled={sending || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      <button className="chat-fab" onClick={() => setOpen(!open)}>
        {open ? 'Close' : 'Chat'}
      </button>
    </>
  );
}

export default ChatWidget;