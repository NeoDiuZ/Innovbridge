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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, session_id: sessionId }),
    });

    const data = await res.json();
    const reply = data.reply;

    setMessages((msgs) => [...msgs, { sender: 'bot', text: reply }]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex flex-col items-center justify-start p-6">
      <div className="w-full max-w-2xl flex justify-between items-center mb-4">
        <div className="text-3xl font-bold text-green-700 animate-pulse">🌱 Coaching Bot</div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Welcome, {user?.email}
          </span>
          <button 
            onClick={signOut}
            className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 space-y-4 overflow-y-auto max-h-[75vh]">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Start chatting with your coach!</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl whitespace-pre-line transition-all duration-300 ${
              msg.sender === 'user'
                ? 'bg-blue-100 text-right ml-auto w-fit'
                : msg.text.startsWith('📝 Summary:')
                ? 'bg-yellow-100 text-gray-800'
                : msg.text.startsWith('🔁 Feedback:')
                ? 'bg-purple-100 text-gray-800'
                : 'bg-green-100 text-left mr-auto w-fit'
            }`}
          >
            <strong>{msg.sender === 'user' ? 'You' : 'Coach'}:</strong> {msg.text}
          </div>
        ))}
        {loading && (
          <div className="bg-green-100 text-left p-3 rounded-xl w-fit animate-pulse">
            <strong>Coach:</strong> Typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex w-full max-w-2xl mt-4">
        <textarea
          rows="2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow p-3 border border-gray-300 rounded-l-xl focus:outline-none resize-none"
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-6 rounded-r-xl hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}