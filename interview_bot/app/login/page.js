'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const router = useRouter();
  const { login, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Set page as loaded after mounting for animations
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  useEffect(() => {
    // Check if the questionnaire has been completed
    const questionnaireCompleted = localStorage.getItem('questionnaire_completed');
    
    if (!questionnaireCompleted && !user) {
      router.push('/questionnaire');
      return;
    }
    
    if (user) {
      router.push('/chat');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Add subtle animation to the button while loading
    const button = e.currentTarget.querySelector('button[type="submit"]');
    button.classList.add('pulse');

    try {
      await login(email, password);
      router.push('/chat');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
      button.classList.remove('pulse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        style={{ 
          opacity: pageLoaded ? 1 : 0,
          top: '1rem',
          right: '1rem'
        }}
      >
        {theme === 'light' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
          </svg>
        )}
      </button>
      
      <div className="auth-card" style={{ opacity: pageLoaded ? 1 : 0, transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)' }}>
        <div className="auth-header" style={{ opacity: pageLoaded ? 1 : 0 }}>
          <h1 className="auth-title" style={{ opacity: pageLoaded ? 1 : 0 }}>Welcome Back</h1>
          <p className="auth-subtitle" style={{ opacity: pageLoaded ? 1 : 0 }}>Log in to continue your interview preparation</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message mb-4">{error}</div>}
          
          <div className="form-group" style={{ opacity: pageLoaded ? 1 : 0 }}>
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{ fontSize: '16px' }}
            />
          </div>
          
          <div className="form-group" style={{ opacity: pageLoaded ? 1 : 0 }}>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ fontSize: '16px' }}
            />
          </div>
          
          <div className="form-group" style={{ opacity: pageLoaded ? 1 : 0 }}>
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              style={{ 
                marginTop: '1.5rem',
                opacity: pageLoaded ? 1 : 0,
                transition: 'all 0.3s ease'
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>
                  Logging in
                  <span className="loading-dot" style={{ width: '4px', height: '4px' }}></span>
                  <span className="loading-dot" style={{ width: '4px', height: '4px' }}></span>
                  <span className="loading-dot" style={{ width: '4px', height: '4px' }}></span>
                </span>
              ) : 'Log In'}
            </button>
          </div>
        </form>
        
        <div className="auth-footer" style={{ opacity: pageLoaded ? 1 : 0 }}>
          Don&apos;t have an account? <Link href="/register" className="auth-link">Sign up</Link>
        </div>

        {/* Show response from questionnaire if applicable */}
        {localStorage.getItem('questionnaire_completed') === 'true' && (
          <div style={{
            marginTop: '2rem',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            background: 'linear-gradient(to right, #ebf5ff, #e6effe)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
            transform: 'translateY(0)',
            animation: 'fadeInUp 0.6s ease-out',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 70%)',
              zIndex: 0
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                width: '2.5rem',
                height: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
                flexShrink: 0
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 style={{
                  margin: '0 0 0.25rem 0',
                  color: '#1e40af',
                  fontWeight: '600',
                  fontSize: '1.125rem'
                }}>
                  Thanks for completing the questionnaire!
                </h3>
                <p style={{
                  margin: 0,
                  color: '#3b82f6',
                  fontSize: '0.9375rem',
                  lineHeight: 1.5
                }}>
                  Your interview practice experience will be personalized based on your responses.
                </p>
              </div>
            </div>
            <style jsx>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
} 