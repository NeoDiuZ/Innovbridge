'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar({ isOpen, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('questionnaire_completed');
    localStorage.removeItem('questionnaire_answers');
    localStorage.removeItem('user_authenticated');
    
    // Redirect to login
    router.push('/welcome');
  };
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:relative md:z-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-md bg-blue-500 flex items-center justify-center text-white mr-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.4 7.34L16.66 4.6A2 2 0 0 0 14 4.53l-9 9a2 2 0 0 0-.57 1.21L4 18.91a1 1 0 0 0 .29.8A1 1 0 0 0 5 20h.09l4.17-.38a2 2 0 0 0 1.21-.57l9-9a1.92 1.92 0 0 0-.07-2.71zM9.08 17.62l-3 .28.27-3L12 9.32l2.7 2.7-5.62 5.6z" fill="currentColor"/>
                </svg>
              </div>
              <span className="font-bold text-xl">CoachBot</span>
            </div>
          </div>
          
          {/* Navigation links */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/chat" 
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    pathname === '/chat' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg 
                    className="w-5 h-5 mr-3"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.5 20 9.06 19.75 7.74 19.28L3 20L4.5 15.5C3.56 14.57 3 13.32 3 12C3 7.58 7.03 4 12 4C16.97 4 21 7.58 21 12Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Chat</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg 
                className="w-5 h-5 mr-3"
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M16 17L21 12L16 7" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M21 12H9" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              Log out
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 