'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import styles from './register.module.css';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await signUp({ 
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to create account');
      }
      
      router.push('/chat');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerContentWrapper}>
        <div className={styles.leftPanel}>
          <div className={styles.brandInfo}>
            <h1 className={styles.brandTitle}>Coaching Bot</h1>
            <p className={styles.brandTagline}>Start your personalized coaching journey today</p>
          </div>
        </div>
        
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>Create an account</h2>
            <p className={styles.formSubtitle}>Join us to get personalized AI coaching</p>
            
            {error && <div className={styles.errorAlert}>{error}</div>}
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.formLabel}>Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className={styles.formControl}
                  placeholder="johndoe"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={styles.formControl}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.formLabel}>Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={styles.formControl}
                    placeholder="••••••••"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={styles.formControl}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="phoneNumber" className={styles.formLabel}>Phone Number (optional)</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={styles.formControl}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className={styles.termsAgreement}>
                By creating an account, you agree to our <Link href="/terms" className={styles.termsLink}>Terms of Service</Link> and <Link href="/privacy" className={styles.termsLink}>Privacy Policy</Link>.
              </div>
              
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
              
              <div className={styles.loginPrompt}>
                Already have an account?{' '}
                <Link href="/login" className={styles.loginLink}>
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 