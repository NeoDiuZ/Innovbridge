'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
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
    router.push('/chat');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #f3f4f6, #e0f2fe)'
    }}>
      <div style={{
        textAlign: 'center',
        padding: isMobile ? '1rem' : '2rem'
      }}>
        <div style={{
          fontSize: isMobile ? '1.5rem' : '1.875rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#047857',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}>
          🌱 Coaching Bot
        </div>
        <p style={{
          color: '#4b5563',
          fontSize: isMobile ? '0.9rem' : '1rem'
        }}>
          Redirecting you to the chat...
        </p>
      </div>
    </div>
  );
}