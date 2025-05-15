'use client';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import MessageBubble from '../components/MessageBubble';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useRouter } from 'next/navigation';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (!isClient) return;

    // Generate a unique session ID when component mounts if it doesn't exist
    if (!sessionId) {
      const newSessionId = `session_${Date.now()}`;
      setSessionId(newSessionId);
      
      // Try to load existing messages from localStorage
      const savedMessages = localStorage.getItem('chat_messages');
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        } catch (e) {
          console.error("Failed to parse messages from localStorage", e);
          localStorage.removeItem('chat_messages'); // Clear corrupted data
          // Fallback to welcome message or DB load if parsing failed
          loadInitialMessages(newSessionId); 
        }
      } else {
        loadInitialMessages(newSessionId);
      }
    }
  }, [isClient, sessionId]);
  
  const loadInitialMessages = async (currentSessionId) => {
    // Try to load messages from database
    try {
      const response = await fetch(`/api/chat/load?sessionId=${currentSessionId}`);
      if (!response.ok) {
        // Handle non-OK responses, e.g., log an error or set a default message
        console.error('Failed to load messages from DB:', response.status);
        addWelcomeMessage();
        return;
      }
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
        localStorage.setItem('chat_messages', JSON.stringify(data.messages));
      } else {
        addWelcomeMessage();
      }
    } catch (error) {
      console.error('Error loading messages from database:', error);
      addWelcomeMessage();
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage = {
      id: `welcome_${Date.now()}`, // ID generated purely client-side
      content: `Hello! I'm your AI coach, here to support and guide you on your journey. I can help you set goals, develop strategies, and provide personalized advice to help you grow. What would you like to work on today?`,
      sender: 'bot',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
    localStorage.setItem('chat_messages', JSON.stringify([welcomeMessage]));
  };
  
  useEffect(() => {
    if (!isClient) return;
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages, isClient]);
  
  useEffect(() => {
    if (!isClient) return;
    // Focus the input field when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isClient]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessageContent = input;
    setInput(''); // Clear input early

    const userMessage = {
      id: `user_${Date.now()}`,
      content: userMessageContent,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => {
      const newMessages = [...prevMessages, userMessage];
      // localStorage.setItem('chat_messages', JSON.stringify(newMessages)); // We'll save after bot response
      return newMessages;
    });
    
    setIsLoading(true);
    
    // Add a placeholder for the bot's message
    const botMessageId = `bot_${Date.now()}`;
    setMessages(prevMessages => [...prevMessages, {
      id: botMessageId,
      content: '', // Start with empty content
      sender: 'bot',
      timestamp: new Date().toISOString(),
      isStreaming: true // Add a flag to indicate streaming
    }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          session_id: sessionId,
          message: userMessageContent 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedBotReply = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedBotReply += chunk;
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, content: accumulatedBotReply, isStreaming: true } 
              : msg
          )
        );
      }
      
      // Final update to the bot message, marking streaming as false
      const finalBotMessage = {
        id: botMessageId,
        content: accumulatedBotReply,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isStreaming: false
      };

      setMessages(prevMessages => {
        const updatedMessages = prevMessages.map(msg => 
          msg.id === botMessageId ? finalBotMessage : msg
        );
        localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
         // Save messages to database (user message + final bot message)
        fetch('/api/chat/save', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            messages: [userMessage, finalBotMessage],
            sessionId: sessionId
            })
        }).catch(dbError => console.error("Error saving to DB after stream:", dbError));
        return updatedMessages;
      });

    } catch (error) {
      console.error('Error sending message or processing stream:', error);
      const errorMessageContent = error.message || "Sorry, there was an error processing your request. Please try again.";
      setMessages(prevMessages => {
        // Remove the streaming placeholder if it exists
        const filteredMessages = prevMessages.filter(msg => msg.id !== botMessageId || !msg.isStreaming);
        const errorMessage = {
          id: `error_${Date.now()}`,
          content: errorMessageContent,
          sender: 'bot',
          error: true,
          timestamp: new Date().toISOString()
        };
        const newMessages = [...filteredMessages, errorMessage];
        localStorage.setItem('chat_messages', JSON.stringify(newMessages));
        // Save error message to database
        fetch('/api/chat/save', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            messages: [userMessage, errorMessage], // Save user message and the error bot message
            sessionId: sessionId
            })
        }).catch(dbError => console.error("Error saving error to DB:", dbError));
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="h-screen flex flex-col bg-secondary-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setMessages([]);
                    localStorage.removeItem('chat_messages');
                    // Add welcome message
                    const welcomeMessage = {
                      id: Date.now(),
                      content: `Hello! I'm your AI coach, here to support and guide you on your journey. I can help you set goals, develop strategies, and provide personalized advice to help you grow. What would you like to work on today?`,
                      sender: 'bot',
                      timestamp: new Date().toISOString()
                    };
                    setMessages([welcomeMessage]);
                    localStorage.setItem('chat_messages', JSON.stringify([welcomeMessage]));
                  }}
                  className="text-sm text-secondary-500 hover:text-secondary-700 flex items-center gap-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Clear chat
                </button>
              </div>
              
              {messages.map((message, index) => (
                <MessageBubble 
                  key={message.id}
                  message={message.content}
                  isUser={message.sender === 'user'}
                  timestamp={message.timestamp}
                  isError={message.error}
                  isStreaming={message.isStreaming}
                />
              ))}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input area */}
          <div className="border-t border-secondary-200 bg-white p-4">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <div className="flex-1 bg-white rounded-xl border border-secondary-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all duration-200">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type your message..."
                    className="w-full p-3 max-h-32 min-h-[3rem] rounded-xl resize-none focus:outline-none"
                    rows={1}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()} 
                  isLoading={isLoading}
                  className="h-11 w-11 p-0 flex-shrink-0 rounded-full"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </form>
              
              <p className="text-xs text-secondary-500 mt-2 text-center">
                Press Enter to send, Shift+Enter for a new line
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 