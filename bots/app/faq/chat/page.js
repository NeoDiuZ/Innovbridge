'use client';
import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import MessageBubble from '../../components/MessageBubble';
import Button from '../../components/ui/Button';

function FAQChatComponent() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    if (!sessionId) {
      setSessionId(`faq_${Date.now()}`);
    }
  }, [sessionId]);

  useEffect(() => {
    if (isClient && messages.length === 0) {
      // Welcome message
      const welcomeMessage = {
        id: `welcome_${Date.now()}`,
        content: `Hello! I'm your FAQ assistant. I'm here to help answer your questions based on our knowledge base. Feel free to ask me anything about InnovBridge, our bots, or how to get started!`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isClient, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isClient && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isClient]);

  const resetChat = () => {
    setMessages([]);
    setSessionId(`faq_${Date.now()}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    setInput('');
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const botMessageId = `bot_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: botMessageId, content: '', sender: 'bot', timestamp: new Date().toISOString(), isStreaming: true },
    ]);

    try {
      const response = await fetch('/api/faq/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages
              .filter(msg => msg.sender !== 'system')
              .map(({ sender, content }) => ({
                role: sender === 'user' ? 'user' : 'assistant',
                content,
              })),
            { role: 'user', content: input },
          ],
        }),
      });

      if (!response.ok) throw new Error('Server error');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, content: accumulated, isStreaming: true } : msg
          )
        );
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId ? { ...msg, content: accumulated.trim(), isStreaming: false } : msg
        )
      );
    } catch (error) {
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== botMessageId),
        {
          id: `error_${Date.now()}`,
          content: error.message || 'Sorry, there was an error processing your request. Please try again.',
          sender: 'bot',
          error: true,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading FAQ Chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-primary-50 to-secondary-50">
      <Header 
        title="FAQ Assistant"
        subtitle="Ask me anything about InnovBridge"
        onReset={resetChat}
        showReset={messages.length > 1}
      />

      <div className="flex-1 overflow-hidden px-6 py-4">
        <div className="h-full max-w-4xl mx-auto bg-white rounded-2xl shadow-subtle flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message.content}
                isUser={message.sender === 'user'}
                isStreaming={message.isStreaming}
                isError={message.error}
                timestamp={message.timestamp}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-6">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me a question..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send'
                )}
              </Button>
            </form>

            <div className="flex justify-center mt-4">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQChatPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading FAQ Chat...</p>
          </div>
        </div>
      }
    >
      <FAQChatComponent />
    </Suspense>
  );
} 