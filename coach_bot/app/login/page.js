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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '1.5rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        padding: '2.5rem',
        transition: 'transform 0.3s ease',
        animation: 'fadeIn 0.5s ease forwards'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, #4299e1 100%)',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            fontSize: '2rem'
          }}>
            🌱
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, var(--primary) 0%, #4299e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Coaching Bot
          </h1>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: '500',
            color: 'var(--muted)',
            marginBottom: '0.5rem'
          }}>
            Welcome back
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
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontSize: '0.875rem',
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
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(0,0,0,0.1)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--fg)',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
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
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <label style={{ 
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--muted)'
              }}>
                Password
              </label>
              <a href="#" style={{
                fontSize: '0.75rem',
                color: 'var(--primary)',
                fontWeight: '500',
                textDecoration: 'none'
              }}>
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(0,0,0,0.1)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--fg)',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
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
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary) 0%, #4299e1 100%)',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? '0.8' : '1',
              boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              marginBottom: '1.5rem'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.3)';
            }}
          >
            {loading ? 'Signing in...' : 'Sign in to account'}
          </button>
        </form>
        
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--muted)',
          textAlign: 'center'
        }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{
            color: 'var(--primary)',
            fontWeight: '500',
            textDecoration: 'none'
          }}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
