'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import { useEffect } from 'react';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({ children }) {
  // Move the viewport height script to a useEffect to avoid hydration errors
  useEffect(() => {
    function setVH() {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    setVH();
    
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);
  
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <title>CoachBot - Your AI Interview Coach</title>
        <meta name="description" content="Practice for job interviews with our AI coach that provides personalized feedback and tips." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-secondary-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}