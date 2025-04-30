'use client';
import { useEffect } from 'react';

export default function ViewportHandler() {
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
  
  // This component doesn't render anything
  return null;
} 