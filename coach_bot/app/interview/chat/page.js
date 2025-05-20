'use client';
import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../../components/Header';
import MessageBubble from '../../components/MessageBubble';
import Button from '../../components/ui/Button';
import EmailPopup from '../../components/EmailPopup';

// Separate component for the main chat functionality
function InterviewChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [feedbackMode, setFeedbackMode] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const interviewData = React.useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(searchParams.get('data') || '{}'));
    } catch {
      return {};
    }
  }, [searchParams]);

  useEffect(() => {
    setIsClient(true);
    if (!sessionId) {
      setSessionId(`interview_${Date.now()}`);
    }
  }, [sessionId]);

  useEffect(() => {
    if (isClient && messages.length === 0) {
      // Welcome message
      const welcomeMessage = {
        id: `welcome_${Date.now()}`,
        content: `Welcome to your ${interviewData.interviewType || ''} interview preparation session for a ${interviewData.role || ''} position! I'll help you practice and improve your interview skills. Let's begin with some questions tailored to your experience level (${interviewData.experience || ''}) and focus areas (${(interviewData.focusAreas || []).join(', ')}). Are you ready to start?`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
      setQuestionIndex(0);
    }
  }, [isClient, interviewData, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isClient && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isClient]);

  // Generate summary when session ends
  useEffect(() => {
    if (showSummary && messages.length > 0 && !summary) {
      (async () => {
        try {
          const res = await fetch('/api/interview/summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages, interviewData }),
          });
          const data = await res.json();
          setSummary(data.summary || 'Summary unavailable.');
        } catch {
          setSummary('Summary unavailable.');
        }
      })();
    }
  }, [showSummary, messages, interviewData, summary]);

  // Show email popup when session ends
  useEffect(() => {
    if (showSummary) {
      setShowEmailPopup(true);
    }
  }, [showSummary]);

  const resetChat = () => {
    setMessages([]);
    setSessionId(`interview_${Date.now()}`);
    setQuestionIndex(0);
    setShowSummary(false);
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
      const response = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(({ sender, content }) => ({
              role: sender === 'user' ? 'user' : 'assistant',
              content,
            })),
            { role: 'user', content: input },
          ],
          interviewData,
          feedbackMode,
          questionIndex,
          totalQuestions,
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

      let finalBotReplyText = accumulated.trim();
      if (finalBotReplyText.includes('[INTERVIEW_SESSION_ENDED]')) {
        finalBotReplyText = finalBotReplyText.replace('[INTERVIEW_SESSION_ENDED]', '').trim();
        setShowSummary(true);
      } else if (questionIndex + 1 < totalQuestions) {
        setQuestionIndex((idx) => idx + 1);
      } else {
        setShowSummary(true);
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId ? { ...msg, content: finalBotReplyText, isStreaming: false } : msg
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

  // Email summary (for popup)
  const handleEmailPopup = async (emailInput) => {
    setEmailStatus('Sending...');
    try {
      const res = await fetch('/api/interview/email-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, summary, transcript: messages, interviewData }),
      });
      const data = await res.json();
      if (data.success) setEmailStatus('Sent!');
      else setEmailStatus('Failed to send.');
    } catch {
      setEmailStatus('Failed to send.');
    } finally {
      setShowEmailPopup(false);
    }
  };

  // Extract model answer from bot message (simple markdown heading or code block)
  const getModelAnswer = (content) => {
    if (!content) return null;
    // Look for ### Model Answer or code block
    const modelMatch = content.match(/### Model Answer[\s\S]*?(?=\n###|$)/i);
    if (modelMatch) return modelMatch[0];
    const codeBlock = content.match(/```[\s\S]*?```/);
    if (codeBlock) return codeBlock[0];
    return null;
  };

  // Determine if current question is behavioral
  const isBehavioral = () => {
    const lastBotMsg = messages.filter(m => m.sender === 'bot').slice(-1)[0]?.content || '';
    return /behavioral|star format|situation.*task.*action.*result/i.test(lastBotMsg);
  };

  return (
    <div className="h-screen flex flex-col bg-secondary-50">
      <Header title="InterviewBot" />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                <div className="text-sm text-secondary-700 font-medium">
                  Question {questionIndex + 1} of {totalQuestions}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-secondary-500">Feedback mode:</span>
                  <button
                    onClick={() => setFeedbackMode((v) => !v)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-150 ${feedbackMode ? 'bg-primary-600 text-white border-primary-600' : 'bg-secondary-100 text-secondary-700 border-secondary-300'}`}
                  >
                    {feedbackMode ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={resetChat}
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
                    timestamp={message.timestamp}
                    isError={message.error}
                    isStreaming={message.isStreaming}
                  />
                  {/* Model answer display for latest bot message */}
                  {message.sender === 'bot' && getModelAnswer(message.content) && (
                    <div className="my-2 p-3 bg-primary-50 border-l-4 border-primary-400 rounded">
                      <div className="font-semibold text-primary-700 mb-1">Model Answer</div>
                      <pre className="whitespace-pre-wrap text-sm text-primary-900">{getModelAnswer(message.content)}</pre>
                    </div>
                  )}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
              {showSummary && (
                <div className="mt-8 p-6 bg-white border border-secondary-200 rounded-xl shadow-subtle">
                  <h2 className="text-lg font-bold mb-2 text-secondary-900">Session Complete</h2>
                  <p className="text-secondary-700 mb-2">Thank you for completing your interview practice session! Would you like to receive a detailed summary and feedback via email?</p>
                  {emailStatus && <div className="text-xs text-secondary-500 mt-1">{emailStatus}</div>}
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-secondary-200 bg-white p-4">
            <div className="max-w-3xl mx-auto">
              {/* STAR-format helper for behavioral questions */}
              {isBehavioral() && (
                <div className="mb-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <div className="font-semibold text-yellow-700 mb-1">STAR Format Helper</div>
                  <ul className="text-sm text-yellow-900 list-disc pl-5">
                    <li><b>Situation</b>: Set the context and background.</li>
                    <li><b>Task</b>: What was the goal or challenge?</li>
                    <li><b>Action</b>: What did you do?</li>
                    <li><b>Result</b>: What was the outcome?</li>
                  </ul>
                </div>
              )}
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
                  disabled={isLoading}
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
        onClose={() => setShowEmailPopup(false)}
        onSubmit={handleEmailPopup}
      />
    </div>
  );
}

// Loading fallback component
function ChatLoading() {
  return (
    <div className="h-screen flex flex-col bg-secondary-50">
      <Header title="InterviewBot" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-secondary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-secondary-600">Loading interview session...</p>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function InterviewChatPage() {
  return (
    <Suspense fallback={<ChatLoading />}>
      <InterviewChatContent />
    </Suspense>
  );
} 