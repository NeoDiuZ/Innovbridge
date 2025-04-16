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
      <div className="card">
        <h1 className="logo">
          <span className="logo-icon">🌱</span>Coaching Assistant
        </h1>
        <h2 className="title">Create Your Account</h2>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              type="text" 
              className="input" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="johndoe"
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              className="input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@example.com"
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input 
              id="phone"
              type="tel" 
              className="input" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
              placeholder="+1 (555) 123-4567"
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              className="input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input 
              id="confirm-password"
              type="password" 
              className="input" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <button type="submit" className="button primary" disabled={loading}>
            {loading ? (
              <>
                <svg className="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" 
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{animation: 'spin 1s linear infinite'}}/>
                </svg>
                Creating Account...
              </>
            ) : (
              <>
                <svg className="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Create Account
              </>
            )}
          </button>
        </form>
        
        <p className="muted">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}