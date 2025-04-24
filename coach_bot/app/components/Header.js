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
    // Check if user is already authenticated and get user info
    const userAuthenticated = localStorage.getItem('user_authenticated') === 'true';
    
    if (userAuthenticated) {
      // Get user info from localStorage if available
      const email = localStorage.getItem('user_email') || 'user@example.com';
      const name = localStorage.getItem('user_name') || 'User';
      setUserInfo({ name, email });
    }
  }, []);
  
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
  
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('questionnaire_completed');
    localStorage.removeItem('questionnaire_answers');
    localStorage.removeItem('user_authenticated');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    
    // Clear authentication cookie
    document.cookie = "user_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // Redirect to home page (which now shows login)
    router.push('/');
  };
  
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
        
        {/* Right - User menu */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full border border-secondary-200 hover:bg-secondary-50 transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <svg className="w-4 h-4 text-secondary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Dropdown menu */}
          <AnimatePresence>
            {isProfileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-medium z-20 overflow-hidden"
                >
                  <div className="p-3 border-b border-secondary-100">
                    <p className="text-sm font-medium text-secondary-900">{userInfo.name}</p>
                    <p className="text-xs text-secondary-500">{userInfo.email}</p>
                  </div>
                  
                  <div className="py-1.5">
                    <MenuItem 
                      onClick={handleLogout}
                      icon={
                        <svg width="16" height="16" className="text-red-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      }
                      className="text-red-600"
                    >
                      Log out
                    </MenuItem>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, current, children }) {
  return (
    <a
      href={href}
      className={`relative px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
        current 
          ? 'text-primary-700' 
          : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
      }`}
    >
      {children}
      {current && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-600 rounded-full"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </a>
  );
}

function MenuItem({ onClick, icon, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-3 py-2 text-sm hover:bg-secondary-50 ${className}`}
    >
      {icon && <span className="w-5 h-5 mr-2.5">{icon}</span>}
      {children}
    </button>
  );
} 