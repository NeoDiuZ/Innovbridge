'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    // Check if questionnaire is completed
    const questionnaireCompleted = localStorage.getItem('questionnaire_completed');
    
    if (questionnaireCompleted === 'true') {
      // If completed, go directly to chat
      router.push('/chat');
    } else {
      // Default landing - show the questionnaire first
      router.push('/questionnaire');
    }
    
    setCheckingStatus(false);
  }, [router]);

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Just a moment...</p>
      </div>
    );
  }

  return null;
}