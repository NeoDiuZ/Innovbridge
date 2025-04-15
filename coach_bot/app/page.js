'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/chat');
    } else {
      router.push('/login');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
      <div className="text-center">
        <div className="text-3xl font-bold mb-4 text-green-700 animate-pulse">
          🌱 Coaching Bot
        </div>
        <p className="text-gray-600">Redirecting you to the right place...</p>
      </div>
    </div>
  );
}