'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Questionnaire from '../components/Questionnaire';

export default function QuestionnairePage() {
  const router = useRouter();
  
  // Handle questionnaire completion
  const handleQuestionnaireComplete = (answers) => {
    // Optionally store answers for personalization if needed
    if (answers) {
      localStorage.setItem('questionnaire_answers', JSON.stringify(answers));
    }
    
    // Redirect to chat page directly
    router.push('/chat');
  };
  
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
          Your personal AI coach to help you achieve your goals and unlock your potential
        </p>
        <p className="text-lg text-secondary-700">
          Please complete this quick survey to help us personalize your experience
        </p>
      </motion.div>
      
      <Questionnaire onComplete={handleQuestionnaireComplete} isModal={false} />
    </div>
  );
} 