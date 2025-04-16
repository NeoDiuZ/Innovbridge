'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp({ email, password, username, phoneNumber });
      if (error) throw error;
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError('Failed to register: ' + err.message);
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
          <h1 className="auth-title">Coaching Bot</h1>
          <h2 className="auth-subtitle">Create your account</h2>
        </div>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert success">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="johndoe"
                autoComplete="username"
                className="input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="+1 (555) 123-4567"
                autoComplete="tel"
                className="input"
              />
            </div>
          </div>
          
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
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                className="input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                className="input"
              />
            </div>
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
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account?{' '}
          <Link href="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}