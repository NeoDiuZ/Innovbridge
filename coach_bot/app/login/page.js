'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Questionnaire from '../components/Questionnaire';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [loginReady, setLoginReady] = useState(false);
  
  useEffect(() => {
    // Check if user is already authenticated
    const userAuthenticated = localStorage.getItem('user_authenticated') === 'true';
    
    if (userAuthenticated) {
      // If already authenticated, go directly to chat
      router.push('/chat');
      return;
    }
    
    // Check if questionnaire has been completed
    const questionnaireCompleted = localStorage.getItem('questionnaire_completed') === 'true';
    
    if (!questionnaireCompleted) {
      // Show questionnaire if not completed
      setShowQuestionnaire(true);
      setLoginReady(false);
    } else {
      // If questionnaire is completed, show login form
      setShowQuestionnaire(false);
      setLoginReady(true);
    }
  }, [router]);
  
  const handleQuestionnaireComplete = (answers) => {
    // Store answers and mark questionnaire as completed
    if (answers) {
      localStorage.setItem('questionnaire_answers', JSON.stringify(answers));
    }
    localStorage.setItem('questionnaire_completed', 'true');
    
    // Hide questionnaire and show login form
    setShowQuestionnaire(false);
    setLoginReady(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Demo mode - no real authentication yet
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user info
      localStorage.setItem('user_authenticated', 'true');
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_name', email.split('@')[0]);
      
      // Redirect to chat
      router.push('/chat');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show questionnaire if needed
  if (showQuestionnaire) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col justify-center items-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-xl mb-8"
        >
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-primary-600 mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.4 7.34L16.66 4.6A2 2 0 0 0 14 4.53l-9 9a2 2 0 0 0-.57 1.21L4 18.91a1 1 0 0 0 .29.8A1 1 0 0 0 5 20h.09l4.17-.38a2 2 0 0 0 1.21-.57l9-9a1.92 1.92 0 0 0-.07-2.71z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-secondary-900 mb-4">CoachBot</h1>
          <p className="text-xl text-secondary-600 mb-6">
            Your personal AI interview coach to help you practice and land your dream job
          </p>
          <p className="text-lg text-secondary-700">
            Please complete this quick survey before logging in
          </p>
        </motion.div>
        
        <Questionnaire onComplete={handleQuestionnaireComplete} isModal={false} />
      </div>
    );
  }
  
  // Show login form only if questionnaire is completed
  if (!loginReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-secondary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-primary-600 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.4 7.34L16.66 4.6A2 2 0 0 0 14 4.53l-9 9a2 2 0 0 0-.57 1.21L4 18.91a1 1 0 0 0 .29.8A1 1 0 0 0 5 20h.09l4.17-.38a2 2 0 0 0 1.21-.57l9-9a1.92 1.92 0 0 0-.07-2.71z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Welcome to CoachBot</h1>
          <p className="mt-2 text-secondary-600">Your AI-powered interview coach</p>
        </motion.div>
        
        <Card animate padding="p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">Log in to your account</h2>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-secondary-500">
                  <path d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-secondary-500">
                  <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700">
                  Remember me
                </label>
              </div>
              
              <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                Forgot password?
              </a>
            </div>
            
            <div className="pt-1">
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full"
              >
                Log in
              </Button>
            </div>
          </form>
          
          <p className="mt-6 text-center text-sm text-secondary-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
} 