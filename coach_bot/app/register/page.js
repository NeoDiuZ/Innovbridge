'use client';
import { useState, useEffect } from 'react';
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const router = useRouter();
  const { signUp } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isMobile = windowWidth < 768;

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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '1.5rem 1rem' : '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : '500px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '1.5rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        padding: isMobile ? '2rem 1.5rem' : '2.5rem',
        transition: 'transform 0.3s ease',
        animation: 'fadeIn 0.5s ease forwards'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: isMobile ? '2rem' : '2rem'
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, #4299e1 100%)',
            borderRadius: '50%',
            width: isMobile ? '70px' : '60px',
            height: isMobile ? '70px' : '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            fontSize: isMobile ? '2.25rem' : '2rem'
          }}>
            🌱
          </div>
          <h1 style={{
            fontSize: isMobile ? '1.75rem' : '1.75rem',
            fontWeight: '700',
            marginBottom: '0.75rem',
            background: 'linear-gradient(135deg, var(--primary) 0%, #4299e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Coaching Bot
          </h1>
          <h2 style={{
            fontSize: isMobile ? '1.2rem' : '1.1rem',
            fontWeight: '500',
            color: 'var(--muted)',
            marginBottom: '0.5rem'
          }}>
            Create your account
          </h2>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            color: 'var(--danger)',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            color: 'var(--success)',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontSize: isMobile ? '1rem' : '0.875rem',
                fontWeight: '500',
                color: 'var(--muted)'
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="johndoe"
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: isMobile ? '0.875rem 1.25rem' : '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--fg)',
                  fontSize: isMobile ? '16px' : '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  minHeight: isMobile ? '52px' : '44px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontSize: isMobile ? '1rem' : '0.875rem',
                fontWeight: '500',
                color: 'var(--muted)'
              }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="+1 (555) 123-4567"
                autoComplete="tel"
                style={{
                  width: '100%',
                  padding: isMobile ? '0.875rem 1.25rem' : '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--fg)',
                  fontSize: isMobile ? '16px' : '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  minHeight: isMobile ? '52px' : '44px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.75rem', 
              fontSize: isMobile ? '1rem' : '0.875rem',
              fontWeight: '500',
              color: 'var(--muted)'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                width: '100%',
                padding: isMobile ? '0.875rem 1.25rem' : '0.75rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(0,0,0,0.1)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--fg)',
                fontSize: isMobile ? '16px' : '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                minHeight: isMobile ? '52px' : '44px'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0,0,0,0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
            gap: '1.25rem',
            marginBottom: '2rem'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontSize: isMobile ? '1rem' : '0.875rem',
                fontWeight: '500',
                color: 'var(--muted)'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: isMobile ? '0.875rem 1.25rem' : '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--fg)',
                  fontSize: isMobile ? '16px' : '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  minHeight: isMobile ? '52px' : '44px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontSize: isMobile ? '1rem' : '0.875rem',
                fontWeight: '500',
                color: 'var(--muted)'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: isMobile ? '0.875rem 1.25rem' : '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--fg)',
                  fontSize: isMobile ? '16px' : '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  minHeight: isMobile ? '52px' : '44px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: isMobile ? '1rem' : '0.8rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary) 0%, #4299e1 100%)',
              color: 'white',
              fontSize: isMobile ? '1rem' : '0.95rem',
              fontWeight: '600',
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? '0.8' : '1',
              boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              minHeight: isMobile ? '56px' : '44px',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseOver={(e) => {
              if (!loading && !isMobile) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.3)';
            }}
          >
            {loading ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
                  animation: 'spin 1s linear infinite'
                }}>
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
        
        <p style={{
          fontSize: isMobile ? '1rem' : '0.875rem',
          color: 'var(--muted)',
          textAlign: 'center'
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{
            color: 'var(--primary)',
            fontWeight: '500',
            textDecoration: 'none',
            display: 'inline-block',
            padding: isMobile ? '0.25rem' : '0',
            margin: isMobile ? '-0.25rem' : '0'
          }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}