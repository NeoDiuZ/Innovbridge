'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isMobile = windowWidth < 768;

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

  return (
    <div className="flex min-h-screen items-center justify-center" style={{
      background: 'linear-gradient(to bottom right, #101628, #1a203c)',
      overflow: 'hidden'
    }}>
      <div style={{
        textAlign: 'center',
        padding: isMobile ? '1.25rem' : '2.5rem',
        backgroundColor: 'rgba(26, 32, 60, 0.7)',
        borderRadius: isMobile ? '12px' : '16px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        maxWidth: isMobile ? '85%' : '400px',
        width: '100%',
        transition: 'all 0.3s ease',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{
          width: isMobile ? '56px' : '64px',
          height: isMobile ? '56px' : '64px',
          backgroundColor: 'var(--primary)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: isMobile ? '1.5rem' : '1.75rem',
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)'
        }}>
          💼
        </div>
        <div style={{
          fontSize: isMobile ? '1.25rem' : '1.875rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#ffffff',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}>
          Pro Interview
        </div>
        <p style={{
          color: '#a3a3a3',
          fontSize: isMobile ? '0.875rem' : '1rem',
          marginBottom: '1.5rem'
        }}>
          Taking you to your interview assistant...
        </p>
        <div style={{
          width: isMobile ? '36px' : '40px',
          height: isMobile ? '36px' : '40px',
          margin: '0 auto',
          border: '3px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '50%',
          borderTopColor: 'var(--primary)',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    </div>
  );
}