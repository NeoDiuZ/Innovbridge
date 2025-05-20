'use client';
import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

// Loading fallback component
function ChatLoading() {
  return (
    <div className="h-screen flex flex-col bg-secondary-50">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-secondary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-secondary-600">Loading interview session...</p>
        </div>
      </div>
    </div>
  );
}

// Dynamically import the chat component with no SSR
const InterviewChatContent = dynamic(
  () => import('./InterviewChatContent'),
  {
    ssr: false,
    loading: () => <ChatLoading />
  }
);

// Main page component
export default function InterviewChatPage() {
  return (
    <Suspense fallback={<ChatLoading />}>
      <InterviewChatContent />
    </Suspense>
  );
} 