'use client';

import React, { Suspense } from 'react';
import InterviewChatContent from './InterviewChatContent';

// You can define a simple loading component here or import one
// For simplicity, using a basic text loader for now
function ClientSpecificLoading() {
  return (
    <div className="h-screen flex flex-col bg-secondary-50">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-secondary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-secondary-600">Initializing chat interface...</p>
        </div>
      </div>
    </div>
  );
}

export default function ChatPageClientBoundary() {
  // This Client Component now directly wraps InterviewChatContent with Suspense
  return (
    <Suspense fallback={<ClientSpecificLoading />}>
      <InterviewChatContent />
    </Suspense>
  );
} 