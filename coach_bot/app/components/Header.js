'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: 'User', email: 'user@example.com' });
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  return (
    <header className={`sticky top-0 z-30 transition-all duration-200 ${
      scrolled ? 'bg-white/90 backdrop-blur-sm shadow-sm' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left - Logo */}
        <div className="flex items-center">
          <div className="flex items-center" onClick={() => router.push('/')} role="button">
            <div className="h-9 w-9 rounded-lg bg-primary-600 flex items-center justify-center text-white mr-2.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.4 7.34L16.66 4.6A2 2 0 0 0 14 4.53l-9 9a2 2 0 0 0-.57 1.21L4 18.91a1 1 0 0 0 .29.8A1 1 0 0 0 5 20h.09l4.17-.38a2 2 0 0 0 1.21-.57l9-9a1.92 1.92 0 0 0-.07-2.71z" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-secondary-900">CoachBot</h1>
          </div>
        </div>
        
        {/* Center - Nav (desktop only) */}
        <nav className="hidden md:flex mx-4 space-x-1 flex-1 justify-center">
          <NavLink href="/chat" current={pathname === '/chat'}>
            Chat
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

// NavLink component for the navigation bar
function NavLink({ href, current, children }) {
  return (
    <a
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        current 
          ? 'bg-primary-50 text-primary-700' 
          : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
      }`}
    >
      {children}
    </a>
  );
}

// MenuItem component for dropdown menu
function MenuItem({ children, onClick, icon, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-secondary-50 ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
} 