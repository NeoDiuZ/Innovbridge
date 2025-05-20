'use client';
import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const botVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  }
};

const userVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  }
};

export default function MessageBubble({ 
  message, 
  isUser, 
  timestamp, 
  isError = false,
  isStreaming = false,
  animate = true
}) {
  const formatMessageText = (text) => {
    if (!text) return '';

    // Split by code blocks, render code blocks separately for styling
    const segments = text.split('```');
    return segments.map((segment, index) => {
      if (index % 2 === 0) {
        // Regular markdown text (headings, bold, etc.)
        return (
          <ReactMarkdown
            key={index}
            components={{
              h3: ({node, ...props}) => <h3 className="text-base font-bold mt-3 mb-1" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
              p: ({node, ...props}) => <p className="mb-2" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
              a: ({node, ...props}) => <a className="text-primary-600 underline" {...props} />,
              // Add more custom renderers as needed
            }}
          >{segment}</ReactMarkdown>
        );
      } else {
        // Code block
        const [language, ...codeLines] = segment.split('\n');
        const code = codeLines.join('\n');
        return (
          <div key={index} className="my-2 rounded-md bg-secondary-800 p-3 overflow-x-auto max-w-full">
            {language && (
              <div className="text-xs text-secondary-400 mb-1">{language}</div>
            )}
            <pre className="text-sm text-secondary-200 font-mono whitespace-pre break-all max-w-full overflow-x-auto">
              {code}
            </pre>
          </div>
        );
      }
    });
  };

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const Component = animate ? motion.div : 'div';
  const variants = isUser ? userVariants : botVariants;
  const animationProps = animate ? {
    initial: "hidden",
    animate: "visible",
    variants
  } : {};

  return (
    <Component
      className={`flex items-start mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      {...animationProps}
    >
      {/* Bot avatar - only show for non-user messages */}
      {!isUser && (
        <div className="mr-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V8.01M12 12V16M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      )}

      {/* Message content */}
      <div className={`relative max-w-2xl ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block rounded-2xl px-4 py-3 max-w-full ${
          isUser
            ? 'bg-primary-600 text-white'
            : isError
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-white border border-secondary-200 text-secondary-800'
        }`}>
          {/* Message text */}
          <div className={`text-sm whitespace-pre-wrap ${isUser ? 'text-left' : ''}`}>
            {(isStreaming && !message) ? (
              <div className="flex space-x-2 py-1">
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            ) : (
              formatMessageText(message)
            )}
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs mt-1 ${isUser ? 'text-primary-200' : 'text-secondary-500'}`}>
            {formattedTime}
          </div>
        </div>
      </div>

      {/* User avatar - only show for user messages */}
      {isUser && (
        <div className="ml-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-secondary-100 flex items-center justify-center text-primary-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      )}
    </Component>
  );
} 