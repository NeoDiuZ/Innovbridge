'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const router = useRouter();
  const { signUp, user } = useAuth();
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
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    // Add subtle animation to the button while loading
    const button = e.currentTarget.querySelector('button[type="submit"]');
    button.classList.add('pulse');

    try {
      const { username, email, password, phoneNumber } = formData;
      const { data, error: signUpError } = await signUp({ 
        username, 
        email, 
        password,
        phoneNumber 
      });
      
      if (signUpError) {
        throw new Error(signUpError.message || 'Registration failed');
      }

      // Add successful page exit animation
      document.querySelector('.auth-card').style.opacity = 0;
      document.querySelector('.auth-card').style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        router.push('/chat');
      }, 300);
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
      button.classList.remove('pulse');
    } finally {
      setIsLoading(false);
    }
  };

  // After registration is successful, display a message about the questionnaire
  const registrationSuccess = () => {
    // Update UI or show message
    setSuccessMessage('Registration successful! Redirecting to login...');
    
    setTimeout(() => {
      router.push('/login');
    }, 2000);
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
          <h1 className="auth-title" style={{ opacity: pageLoaded ? 1 : 0 }}>Create Account</h1>
          <p className="auth-subtitle" style={{ opacity: pageLoaded ? 1 : 0 }}>Fill out the form to get started</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group" style={{ opacity: pageLoaded ? 1 : 0 }}>
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="input-field"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              required
              style={{ fontSize: '16px' }}
            />
          </div>
          
          <div className="form-group" style={{ opacity: pageLoaded ? 1 : 0 }}>
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-field"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              style={{ fontSize: '16px' }}
            />
          </div>
          
          <div className="form-group" style={{ opacity: pageLoaded ? 1 : 0 }}>
            <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              className="input-field"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              required
              style={{ fontSize: '16px' }}
            />
          </div>
          
          <div className="form-group" style={{ opacity: pageLoaded ? 1 : 0 }}>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input-field"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={{ fontSize: '16px' }}
            />
          </div>
          
          <div className="form-group" style={{ opacity: pageLoaded ? 1 : 0 }}>
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input-field"
              value={formData.confirmPassword}
              onChange={handleChange}
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
                Creating Account
                <span className="loading-dot" style={{ width: '4px', height: '4px' }}></span>
                <span className="loading-dot" style={{ width: '4px', height: '4px' }}></span>
                <span className="loading-dot" style={{ width: '4px', height: '4px' }}></span>
              </span>
            ) : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer" style={{ opacity: pageLoaded ? 1 : 0 }}>
          Already have an account? <Link href="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
} 