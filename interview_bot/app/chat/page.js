'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';

// Helper function to format message text with line breaks and lists
const formatMessageText = (text) => {
  if (!text) return '';
  
  // Replace numbered lists (1. 2. etc) with proper HTML
  let formattedText = text.replace(/(\d+)\.\s+/g, '<strong>$1.</strong> ');
  
  // Replace plain line breaks with HTML breaks
  formattedText = formattedText.replace(/\n/g, '<br />');
  
  // Add extra spacing for readability after question sections
  formattedText = formattedText.replace(/(\?<br \/>)/g, '?<br /><br />');
  
  return formattedText;
};

// Helper to format date for session display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  // For today's sessions, show time only
  if (diffInDays === 0) {
    return `Today at ${date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })}`;
  }
  
  // For yesterday
  if (diffInDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })}`;
  }
  
  // For this week
  if (diffInDays < 7) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
  
  // For older dates
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
  });
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isChatConcluded, setIsChatConcluded] = useState(false);

  // Initialize session ID when component mounts
  useEffect(() => {
    // Generate a unique session ID if not exists
    const existingSessionId = localStorage.getItem('chatSessionId');
    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Load chat history from the database when session ID is set
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!sessionId) return;
      
      setIsLoadingHistory(true);
      try {
        const response = await fetch(`/api/chat/history?session_id=${sessionId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.messages && data.messages.length > 0) {
            // Filter out system messages
            const chatMessages = data.messages
              .filter(msg => msg.role !== 'system')
              .map(msg => ({
                id: msg.id,
                text: msg.content,
                sender: msg.role === 'user' ? 'user' : 'bot',
                timestamp: msg.createdAt,
              }));
              
            setMessages(chatMessages);
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadChatHistory();
  }, [sessionId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const startNewSession = () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chatSessionId', newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
    setIsChatConcluded(false);
  };
  
  const checkIfChatConcluded = (message) => {
    // Chat is concluded if the message contains conclusion indicators
    const conclusionPhrases = [
      "thank you for your time",
      "thank you for participating",
      "this concludes our interview",
      "end of our interview",
      "interview has concluded",
      "interview is now complete",
      "that concludes our interview",
      "our interview has come to an end",
      "your interview is complete"
    ];
    
    return conclusionPhrases.some(phrase => 
      message.toLowerCase().includes(phrase.toLowerCase())
    );
  };

  const resetCurrentChat = () => {
    if (window.confirm("Are you sure you want to start a new interview? Your current conversation will not be accessible afterwards.")) {
      // Create a completely new session ID
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
      
      // Clear the current messages display
      setMessages([]);
      setIsChatConcluded(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !sessionId || isChatConcluded) return;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);
    
    try {
      // API call to get bot response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          session_id: sessionId, 
          message: inputMessage 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.error || data.details || 'Failed to get response');
      }
      
      // Simulate typing delay
      setTimeout(() => {
        setIsTyping(false);
        
        // Add bot response to chat
        const botMessage = {
          id: Date.now() + 1,
          text: data.reply,
          sender: 'bot',
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // Check if the chat has concluded based on API response
        if (data.concluded) {
          setIsChatConcluded(true);
        } else {
          // Also check with our client-side detection as a fallback
          if (checkIfChatConcluded(data.reply)) {
            setIsChatConcluded(true);
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Wait a bit before showing the error to simulate typing
      setTimeout(() => {
        setIsTyping(false);
        
        // Add error message
        const errorMessage = {
          id: Date.now() + 1,
          text: `Sorry, there was an error: ${error.message}`,
          sender: 'bot',
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingIndicator = () => (
    <div className="message message-bot" style={{ maxWidth: '40%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        <span className="loading-dot"></span>
        <span className="loading-dot"></span>
        <span className="loading-dot"></span>
      </div>
    </div>
  );

  if (isLoadingHistory) {
    return (
      <div className="chat-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="shimmer" style={{ width: '150px', height: '24px', borderRadius: '4px', margin: '8px 0' }}></div>
        <div className="shimmer" style={{ width: '180px', height: '16px', borderRadius: '4px', margin: '8px 0' }}></div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="chat-title">Interview Assistant</div>
          {messages.length > 0 && !isChatConcluded && (
            <button
              onClick={resetCurrentChat}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                marginLeft: '0.5rem'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <path d="M3 2v6h6"></path>
                <path d="M3 13a9 9 0 1 0 3-7.7L3 8"></path>
              </svg>
              Start Over
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            style={{ position: 'static', padding: '0.5rem' }}
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="m4.93 4.93 1.41 1.41"></path>
                <path d="m17.66 17.66 1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="m6.34 17.66-1.41 1.41"></path>
                <path d="m19.07 4.93-1.41 1.41"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-container" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: '1rem'
          }}>
            <h3 style={{ marginBottom: '0.75rem', fontWeight: '600', fontSize: '1rem' }}>Start a Conversation</h3>
            <p style={{ fontSize: '0.875rem' }}>Send a message to begin your interview session.</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
                style={{ 
                  animationDelay: '0.1s',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {message.sender === 'bot' ? (
                  <div dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }} />
                ) : (
                  message.text
                )}
              </div>
            ))}
            {isTyping && <LoadingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {isChatConcluded && (
        <div className="concluded-chat-notification" style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          width: '100%',
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          padding: '0.75rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 10,
          animation: 'slideUpFade 0.3s ease-out forwards'
        }}>
          <div>This interview has concluded. Thank you for your participation!</div>
          <button
            onClick={startNewSession}
            style={{
              background: 'white',
              color: 'var(--primary-color)',
              border: 'none',
              borderRadius: '0.25rem',
              padding: '0.5rem 1rem',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Interview
          </button>
        </div>
      )}
      
      <form className="chat-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isChatConcluded ? "This interview has concluded. Start a new session." : "Type your message..."}
          disabled={isLoading || isChatConcluded}
          style={{ 
            fontSize: '16px',
            opacity: isChatConcluded ? 0.7 : 1,
            cursor: isChatConcluded ? 'not-allowed' : 'text'
          }}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={isLoading || !inputMessage.trim() || isChatConcluded}
          style={{ opacity: isLoading || !inputMessage.trim() || isChatConcluded ? 0.7 : 1 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </form>
    </div>
  );
} 