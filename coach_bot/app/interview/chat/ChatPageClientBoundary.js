'use client';

import React from 'react';
import InterviewChatContent from './InterviewChatContent';

export default function ChatPageClientBoundary() {
  // This component is a client component.
  // It renders the InterviewChatContent which uses client-side hooks.
  return <InterviewChatContent />;
} 