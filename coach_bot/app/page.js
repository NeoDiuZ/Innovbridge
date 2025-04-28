'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Always redirect to questionnaire page as the starting point
    router.push('/questionnaire');
  }, [router]);
  
  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-secondary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-secondary-600">Loading...</p>
      </div>
    </div>
  );
}