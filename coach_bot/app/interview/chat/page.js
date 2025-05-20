import ChatPageClientBoundary from './ChatPageClientBoundary';
import React from 'react';

// The main ChatLoading component (previously in page.js) can be kept if needed elsewhere,
// or removed if ClientSpecificLoading in ChatPageClientBoundary is sufficient.
// For this example, we assume ChatPageClientBoundary handles its own loading state
// for the parts that need suspense due to useSearchParams.

export default function InterviewChatPage() {
  // This page is a Server Component by default.
  // It renders the ChatPageClientBoundary, which is a Client Component
  // and internally handles the Suspense for useSearchParams.
  return <ChatPageClientBoundary />;
} 