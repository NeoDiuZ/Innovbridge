'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, session_id: sessionId }),
      });

      const data = await res.json();
      const reply = data.reply;
      setMessages((msgs) => [...msgs, { sender: 'bot', text: reply }]);
    } catch (err) {
      setMessages((msgs) => [...msgs, {
        sender: 'bot',
        text: '❌ Error: Could not connect to the coaching service.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h2 style={logoStyle}>🌱 Coaching Bot</h2>
        <span>Welcome, {user?.email}</span>
        <button onClick={signOut} style={logoutBtn}>Logout</button>
      </div>

      <div style={chatBox}>
        {messages.map((msg, idx) => (
          <div key={idx} style={msg.sender === 'user' ? userBubble : botBubble}>
            <strong>{msg.sender === 'user' ? 'You' : 'Coach'}:</strong> {msg.text}
          </div>
        ))}
        {loading && <div style={botBubble}>Coach: Typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div style={inputRow}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Type your message..."
          style={inputBox}
        />
        <button onClick={sendMessage} style={sendBtn}>Send</button>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem',
};

const headerStyle = {
  width: '100%',
  maxWidth: '700px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
};

const logoStyle = { color: 'var(--color-secondary)', fontSize: '1.5rem' };

const chatBox = {
  backgroundColor: 'var(--color-card)',
  padding: '1rem',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '700px',
  flexGrow: 1,
  overflowY: 'auto',
  maxHeight: '60vh',
  marginBottom: '1rem',
};

const userBubble = {
  backgroundColor: 'var(--color-primary)',
  color: '#fff',
  borderRadius: '12px',
  padding: '0.75rem',
  marginBottom: '0.5rem',
  textAlign: 'right',
};

const botBubble = {
  backgroundColor: 'var(--color-input-bg)',
  borderRadius: '12px',
  padding: '0.75rem',
  marginBottom: '0.5rem',
  textAlign: 'left',
};

const inputRow = {
  display: 'flex',
  width: '100%',
  maxWidth: '700px',
};

const inputBox = {
  flexGrow: 1,
  padding: '0.75rem',
  borderRadius: '8px 0 0 8px',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-input-bg)',
  color: 'var(--color-text)',
  resize: 'none',
};

const sendBtn = {
  padding: '0.75rem 1.25rem',
  backgroundColor: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: '0 8px 8px 0',
  cursor: 'pointer',
};

const logoutBtn = {
  backgroundColor: 'var(--color-error)',
  color: '#fff',
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};
