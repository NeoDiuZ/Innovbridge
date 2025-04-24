'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Welcome() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login page
    router.push('/login');
  }, [router]);

  // This page will just redirect, so we don't need to render anything
  return null;
} 