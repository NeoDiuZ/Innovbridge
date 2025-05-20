'use client';
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import MessageBubble from '../components/MessageBubble';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmailPopup from '../components/EmailPopup';
import { useRouter } from 'next/navigation';

// Phrase the bot uses to ask for a rating (must match the system prompt)
const BOT_RATING_REQUEST_PHRASE = "On a scale of 1-10, how would you rate this coaching session? Please type your rating as a number.";
const SESSION_ENDED_MARKER = "[SESSION_ENDED_MARKER]"; // New marker

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isAwaitingTypedRating, setIsAwaitingTypedRating] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState(null);
  const [hasSentQuestionnaireAnswers, setHasSentQuestionnaireAnswers] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();
  
  useEffect(() => {
    setIsClient(true);
    const savedAnswers = localStorage.getItem('questionnaire_answers');
    if (savedAnswers) {
      try {
        setQuestionnaireAnswers(JSON.parse(savedAnswers));
      } catch (e) {
        console.error("Failed to parse questionnaire answers from localStorage:", e);
        setQuestionnaireAnswers({});
      }
    } else {
      setQuestionnaireAnswers({});
    }
  }, []);
  
  useEffect(() => {
    if (!isClient) return;

    const handleStorageChange = (event) => {
      if (event.key === 'questionnaire_answers') {
        console.log('questionnaire_answers changed in localStorage');
        let newAnswers = {};
        if (event.newValue) {
          try {
            newAnswers = JSON.parse(event.newValue);
          } catch (e) {
            console.error("Failed to parse new questionnaire answers from storage event:", e);
            // Keep newAnswers as {} if parsing fails
          }
        }
        setQuestionnaireAnswers(newAnswers); // Update state

        // Directly orchestrate the chat reset with the new answers
        setMessages([]);
        localStorage.removeItem('chat_messages');
        const newSessionId = `session_${Date.now()}`;
        setSessionId(newSessionId); 
        setHasSentQuestionnaireAnswers(false);
        setIsAwaitingTypedRating(false);
        addWelcomeMessage(true, newAnswers); // Use newAnswers directly
        console.log("Chat session has been reset due to questionnaire update.");
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isClient]); // addWelcomeMessage is stable, no need to add it as a dependency if it doesn't use component state itself in a way that creates loops
  
  useEffect(() => {
    if (!isClient || questionnaireAnswers === null) return;

    if (!sessionId) {
      initializeSession(questionnaireAnswers);
    }
  }, [isClient, sessionId, questionnaireAnswers]);
  
  const initializeSession = (currentQuestionnaireAnswers) => {
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);
    setHasSentQuestionnaireAnswers(false);
    setIsAwaitingTypedRating(false);
    
    const savedMessages = localStorage.getItem('chat_messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse messages from localStorage", e);
        localStorage.removeItem('chat_messages'); 
        addWelcomeMessage(true, currentQuestionnaireAnswers);
      }
    } else {
      addWelcomeMessage(true, currentQuestionnaireAnswers);
    }
  };

  const resetChatAndSession = () => {
    setMessages([]);
    localStorage.removeItem('chat_messages');
    setSessionId('');
    console.log("Chat session has been reset.");
  };

  const loadInitialMessages = async (currentSessionId) => {
    try {
      const response = await fetch(`/api/chat/load?sessionId=${currentSessionId}`);
      if (!response.ok) {
        console.error('Failed to load messages from DB:', response.status);
        addWelcomeMessage(false, questionnaireAnswers);
        return;
      }
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
        localStorage.setItem('chat_messages', JSON.stringify(data.messages));
      } else {
        addWelcomeMessage(true, questionnaireAnswers);
      }
    } catch (error) {
      console.error('Error loading messages from database:', error);
      addWelcomeMessage(true, questionnaireAnswers);
    }
  };

  const addWelcomeMessage = (isNewSession = false, answers = null) => {
    let content = `Hello! I'm your AI coach, here to support and guide you on your journey. I can help you set goals, develop strategies, and provide personalized advice to help you grow. What would you like to work on today?`;

    if (isNewSession && answers && typeof answers === 'object' && Object.keys(answers).length > 0) {
      let personalizedPart = "";
      if (answers.primary_coaching_goal) {
        personalizedPart = ` I see you're looking to focus on "${answers.primary_coaching_goal}".`;
      } else if (answers.challenge_to_overcome) {
         personalizedPart = ` I understand you're working on overcoming "${answers.challenge_to_overcome}".`;
      } else {
        const firstKey = Object.keys(answers)[0];
        if (firstKey && answers[firstKey] && typeof answers[firstKey] === 'string') {
            const firstAnswerPreview = answers[firstKey].length > 70 ? answers[firstKey].substring(0, 67) + "..." : answers[firstKey];
            personalizedPart = ` I see you mentioned an interest regarding "${firstAnswerPreview}".`;
        } else {
            personalizedPart = " I've received your initial thoughts from the questionnaire.";
        }
      }
      content = `Hello!${personalizedPart} I'm your AI coach, ready to help you achieve your objectives. What would you like to work on today?`;
    }

    const welcomeMessage = {
      id: `welcome_${Date.now()}`,
      content: content,
      sender: 'bot',
      timestamp: new Date().toISOString()
    };

    if (isNewSession) {
        setMessages([welcomeMessage]);
        localStorage.setItem('chat_messages', JSON.stringify([welcomeMessage]));
    } else {
        setMessages(prev => {
            if (prev.length > 0 && prev[prev.length -1].id.startsWith('welcome_') && prev[prev.length -1].content === content) {
                return prev;
            }
            return [...prev, welcomeMessage];
        });
    }
  };
  
  useEffect(() => {
    if (!isClient) return;
    scrollToBottom();
  }, [messages, isClient]);
  
  useEffect(() => {
    if (!isClient) return;
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
    setInput('');

    let payload = {
      session_id: sessionId,
      message: userMessageContent,
    };

    if (questionnaireAnswers && Object.keys(questionnaireAnswers).length > 0 && !hasSentQuestionnaireAnswers) {
      payload.questionnaire_answers = questionnaireAnswers;
      setHasSentQuestionnaireAnswers(true);
    }

    if (isClient && isAwaitingTypedRating) {
      const extractedRating = parseInt(userMessageContent.match(/\d+/)?.[0], 10);
      if (!isNaN(extractedRating) && extractedRating >= 1 && extractedRating <= 10) {
        try {
          await fetch('/api/chat/save-typed-rating', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: sessionId, rating: extractedRating }),
          });
        } catch (error) {
          console.error("Error saving typed rating to DB:", error);
        }
      }
      setIsAwaitingTypedRating(false);
    }

    const userMessage = {
      id: `user_${Date.now()}`,
      content: userMessageContent,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    
    const botMessageId = `bot_${Date.now()}`;
    setMessages(prevMessages => [...prevMessages, {
      id: botMessageId,
      content: '',
      sender: 'bot',
      timestamp: new Date().toISOString(),
      isStreaming: true
    }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error(`Server error: ${response.status} ${response.statusText}`);
      if (!response.body) throw new Error('Response body is null');

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
      
      let finalBotReplyText = accumulatedBotReply.trim();
      let sessionHasEnded = false;

      if (finalBotReplyText.includes(SESSION_ENDED_MARKER)) {
        sessionHasEnded = true;
        finalBotReplyText = finalBotReplyText.replace(SESSION_ENDED_MARKER, '').trim();
      }

      const finalBotMessage = {
        id: botMessageId,
        content: finalBotReplyText,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isStreaming: false
      };

      if (isClient && finalBotReplyText.includes(BOT_RATING_REQUEST_PHRASE)) {
        setIsAwaitingTypedRating(true);
      }

      setMessages(prevMessages => {
        const updatedMessages = prevMessages.map(msg => 
          msg.id === botMessageId ? finalBotMessage : msg
        );
        localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });

      fetch('/api/chat/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [userMessage, finalBotMessage], sessionId: sessionId })
      }).catch(dbError => console.error("Error saving to DB after stream:", dbError));

      if (sessionHasEnded) {
        setShowEmailPopup(true);
      }

    } catch (error) {
      console.error('Error sending message or processing stream:', error);
      const errorMessageContent = error.message || "Sorry, there was an error processing your request. Please try again.";
      
      const errorBotMessage = {
        id: `error_${Date.now()}`,
        content: errorMessageContent,
        sender: 'bot',
        error: true,
        timestamp: new Date().toISOString()
      };

      setMessages(prevMessages => {
        const filteredMessages = prevMessages.filter(msg => msg.id !== botMessageId || !msg.isStreaming);
        const newMessages = [...filteredMessages, errorBotMessage];
        localStorage.setItem('chat_messages', JSON.stringify(newMessages));
        return newMessages;
      });

      fetch('/api/chat/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [userMessage, errorBotMessage], sessionId: sessionId })
      }).catch(dbError => console.error("Error saving error to DB:", dbError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (email) => {
    // console.log('Email submitted:', email, 'for session:', sessionId);
    // Here you would call your API to send the summary
    try {
      const response = await fetch('/api/chat/send-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, email, messages }), // Send messages for summary
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send summary.');
      }
      // alert('Summary will be sent to your email!'); // Or use a more sophisticated notification
    } catch (error) {
      console.error('Error sending summary email:', error);
      // Here, you might want to inform the user on the popup itself.
      // For now, we'll throw the error so the popup's error state can catch it.
      throw error; 
    } finally {
      setShowEmailPopup(false);
      resetChatAndSession();
    }
  };

  const handleCloseEmailPopup = () => {
    setShowEmailPopup(false);
    resetChatAndSession(); // Reset chat even if they close without submitting
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
                  onClick={resetChatAndSession}
                  className="text-sm text-secondary-500 hover:text-secondary-700 flex items-center gap-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Clear chat
                </button>
              </div>
              
              {messages.map((message) => (
                <React.Fragment key={message.id}>
                  <MessageBubble 
                    message={message.content}
                    isUser={message.sender === 'user'}
                    isSystem={message.sender === 'system'}
                    timestamp={message.timestamp}
                    isError={message.error}
                    isStreaming={message.isStreaming}
                  />
                </React.Fragment>
              ))}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input area */}
          <div className="border-t border-secondary-200 bg-white p-4">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
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
                  placeholder={"Type your message..."}
                  className="w-full p-3 max-h-32 min-h-[3rem] rounded-xl resize-none focus:outline-none border border-secondary-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all duration-200"
                  rows={1}
                  disabled={false}
                />
                
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

      <EmailPopup
        isOpen={showEmailPopup}
        onClose={handleCloseEmailPopup}
        onSubmit={handleEmailSubmit}
      />
    </div>
  );
} 