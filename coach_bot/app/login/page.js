'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import styles from './login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data, error } = await signIn({ email, password });
      
      if (error) {
        throw new Error(error.message || 'Failed to sign in');
      }
      
      router.push('/chat');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginContentWrapper}>
        <div className={styles.leftPanel}>
          <div className={styles.brandInfo}>
            <h1 className={styles.brandTitle}>Coaching Bot</h1>
            <p className={styles.brandTagline}>Your AI-powered coaching assistant</p>
          </div>
        </div>
        
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSubtitle}>Sign in to your account</p>
            
            {error && <div className={styles.errorAlert}>{error}</div>}
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.formControl}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label htmlFor="password" className={styles.formLabel}>Password</label>
                  <Link href="/forgot-password" className={styles.forgotPasswordLink}>
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.formControl}
                  placeholder="••••••••"
                />
              </div>
              
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              
              <div className={styles.registerPrompt}>
                Don't have an account?{' '}
                <Link href="/register" className={styles.registerLink}>
                  Register now
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 