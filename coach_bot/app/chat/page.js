'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import styles from './chat.module.css';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [sessionId, setSessionId] = useState('');
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);
  
  useEffect(() => {
    // Generate a unique session ID when component mounts
    if (!sessionId && user) {
      const newSessionId = `session_${user?.id || 'anonymous'}_${Date.now()}`;
      setSessionId(newSessionId);
    }
  }, [user, sessionId]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    // Focus the input field when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Add a welcome message when the chat loads, but only once
    if (user && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        content: `Hello ${user?.username || 'there'}! I'm your AI coaching assistant. How can I help you today?`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);
    
    try {
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ 
          session_id: sessionId,
          message: userInput 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from assistant');
      }
      
      const botResponse = {
        id: Date.now(),
        content: data.reply,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages(prevMessages => [...prevMessages, {
        id: Date.now(),
        content: "Sorry, there was an error processing your request. Please try again.",
        sender: 'bot',
        error: true,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading chat...</p>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h1>Coaching Chat</h1>
        <div className={styles.userInfo}>
          <span>{user?.username || 'User'}</span>
          <button 
            className={styles.logoutButton}
            onClick={signOut}
          >
            Sign Out
          </button>
        </div>
      </div>
      
      <div className={styles.chatBody}>
        <div className={styles.messagesContainer}>
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`${styles.messageBox} ${message.sender === 'user' ? styles.userMessage : styles.botMessage} ${message.error ? styles.errorMessage : ''}`}
            >
              <div className={styles.messageContent}>
                {message.content}
              </div>
              <div className={styles.messageTimestamp}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className={`${styles.messageBox} ${styles.botMessage} ${styles.typingIndicator}`}>
              <div className={styles.typingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className={styles.chatFooter}>
        <form onSubmit={handleSendMessage} className={styles.messageForm}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className={styles.messageInput}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={styles.sendButton}
            disabled={isLoading || !input.trim()}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
} 