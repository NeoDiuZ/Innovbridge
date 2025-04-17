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
  const { signIn } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Set page as loaded after mounting for animations
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Add subtle animation to the button while loading
    const button = e.currentTarget.querySelector('button[type="submit"]');
    button.classList.add('pulse');

    try {
      const { data, error: loginError } = await signIn({ email, password });
      
      if (loginError) {
        throw new Error(loginError.message || 'Failed to login');
      }

      // Add successful page exit animation
      document.querySelector('.auth-card').style.opacity = 0;
      document.querySelector('.auth-card').style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        router.push('/chat');
      }, 300);
    } catch (err) {
      setError(err.message || 'An error occurred during login');
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
          <h1 className="auth-title" style={{ opacity: pageLoaded ? 1 : 0 }}>Sign In</h1>
          <p className="auth-subtitle" style={{ opacity: pageLoaded ? 1 : 0 }}>Enter your credentials to continue</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
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
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              marginTop: '1.5rem',
              opacity: pageLoaded ? 1 : 0,
              transition: 'all 0.3s ease'
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>
                Signing in
                <span className="loading-dot" style={{ width: '4px', height: '4px' }}></span>
                <span className="loading-dot" style={{ width: '4px', height: '4px' }}></span>
                <span className="loading-dot" style={{ width: '4px', height: '4px' }}></span>
              </span>
            ) : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer" style={{ opacity: pageLoaded ? 1 : 0 }}>
          Don&apos;t have an account? <Link href="/register" className="auth-link">Create an account</Link>
        </div>
      </div>
    </div>
  );
} 