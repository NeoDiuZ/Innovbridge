'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/chat');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn({ email, password });
      if (error) throw error;
    } catch (err) {
      setError('Failed to sign in: ' + (err.message || 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            🌱
          </div>
          <h1 className="auth-title">
            Coaching Bot
          </h1>
          <h2 className="auth-subtitle">
            Welcome back
          </h2>
        </div>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
              className="input"
            />
          </div>
          
          <div className="form-group">
            <div className="password-header">
              <label className="form-label">
                Password
              </label>
              <a href="#" className="auth-link forgot-password">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
              className="input"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`button primary ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="spinner">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" 
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        
        <p className="auth-footer">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="auth-link">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
