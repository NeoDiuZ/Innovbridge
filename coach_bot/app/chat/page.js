'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: 'var(--card-bg)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem'
        }}>
          <span style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, var(--primary) 0%, #4299e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            🌱 Coaching Bot
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.25rem'
        }}>
          <span style={{ 
            fontWeight: 500,
            color: 'var(--muted)'
          }}>
            {user?.email}
          </span>
          <button style={{
            backgroundColor: 'transparent',
            color: 'var(--danger)',
            border: '1px solid var(--danger)',
            borderRadius: '0.5rem',
            padding: '0.5rem 1.25rem',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease'
          }} 
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--danger)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--danger)';
          }}
          onClick={signOut}>
            Logout
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <div ref={chatBoxRef} style={{
        flexGrow: 1,
        padding: '1.5rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto'
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            opacity: '0.8',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, #4299e1 100%)',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              fontSize: '2.5rem'
            }}>
              🌱
            </div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: 'var(--fg)'
            }}>
              Welcome to your coaching session
            </h3>
            <p style={{
              color: 'var(--muted)',
              maxWidth: '450px',
              lineHeight: '1.6'
            }}>
              Ask a question or share something you&apos;d like guidance on to begin your conversation
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                width: '100%'
              }}
            >
              {msg.sender === 'bot' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #4299e1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  fontSize: '1rem'
                }}>
                  🌱
                </div>
              )}
              <div style={{
                backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'var(--card-bg)',
                color: msg.sender === 'user' ? 'white' : 'var(--fg)',
                padding: '1rem 1.25rem',
                borderRadius: msg.sender === 'user' ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                maxWidth: '65%',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                lineHeight: '1.5',
                fontSize: '0.95rem',
                border: msg.sender === 'bot' ? '1px solid rgba(0,0,0,0.05)' : 'none'
              }}>
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '12px',
                  fontSize: '0.875rem'
                }}>
                  👤
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            width: '100%',
            alignItems: 'center'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, #4299e1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              fontSize: '1rem'
            }}>
              🌱
            </div>
            <div style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--fg)',
              padding: '1rem 1.25rem',
              borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem',
              display: 'inline-block',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <div className="typing-dots">Typing</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        backgroundColor: 'var(--card-bg)',
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-end',
          position: 'relative'
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            style={{
              flexGrow: 1,
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '1rem',
              padding: '0.875rem 1.25rem',
              resize: 'none',
              minHeight: '2.75rem',
              maxHeight: '150px',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--fg)',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              outline: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0,0,0,0.1)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #4299e1 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '1rem',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              height: '2.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.3)';
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
