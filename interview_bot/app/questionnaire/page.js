'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

const questions = [
  {
    id: 1,
    question: "What type of job interview are you preparing for?",
    options: [
      { id: 'a', text: "Entry-level position" },
      { id: 'b', text: "Mid-level management" },
      { id: 'c', text: "Senior leadership role" },
      { id: 'd', text: "Technical specialist position" },
      { id: 'e', text: "Just practicing for future opportunities" }
    ]
  },
  {
    id: 2,
    question: "What's your biggest challenge when it comes to job interviews?",
    options: [
      { id: 'a', text: "Answering technical questions confidently" },
      { id: 'b', text: "Speaking about my achievements without sounding arrogant" },
      { id: 'c', text: "Staying calm and managing interview anxiety" },
      { id: 'd', text: "Crafting compelling stories about my experience" },
      { id: 'e', text: "Preparing for unexpected questions" }
    ]
  },
  {
    id: 3,
    question: "How much interview practice have you had in the past month?",
    options: [
      { id: 'a', text: "None at all" },
      { id: 'b', text: "1-2 mock interviews" },
      { id: 'c', text: "3-5 practice sessions" },
      { id: 'd', text: "More than 5 practice interviews" },
      { id: 'e', text: "I've had actual interviews but not practice ones" }
    ]
  },
  {
    id: 4,
    question: "What would help you most in your interview preparation?",
    options: [
      { id: 'a', text: "Personalized feedback on my responses" },
      { id: 'b', text: "Industry-specific interview questions" },
      { id: 'c', text: "Unlimited practice in a stress-free environment" },
      { id: 'd', text: "Questions that adapt to my experience level" },
      { id: 'e', text: "Realistic simulation of interview conditions" }
    ]
  },
  {
    id: 5,
    question: "How soon is your next important interview?",
    options: [
      { id: 'a', text: "This week" },
      { id: 'b', text: "Within the next month" },
      { id: 'c', text: "In 1-3 months" },
      { id: 'd', text: "More than 3 months away" },
      { id: 'e', text: "No specific date, but want to be prepared" }
    ]
  }
];

// Benefits to show during the questionnaire
const benefits = [
  {
    title: "AI-Powered Practice",
    description: "Get realistic interview simulations tailored to your experience level"
  },
  {
    title: "Instant Feedback",
    description: "Receive detailed analysis of your responses and areas for improvement"
  },
  {
    title: "Confidence Building",
    description: "Practice in a stress-free environment until you feel fully prepared"
  },
  {
    title: "Industry Expertise",
    description: "Access questions specific to your target role and industry"
  },
  {
    title: "24/7 Availability",
    description: "Practice anytime, anywhere, as much as you need"
  }
];

export default function Questionnaire() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [animate, setAnimate] = useState(true);
  const [animateDirection, setAnimateDirection] = useState('slide-left');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to chat
    if (user) {
      router.push('/chat');
    }
    
    // Check if questionnaire was already completed
    if (localStorage.getItem('questionnaire_completed') === 'true') {
      router.push('/login');
    }

    // Add base CSS directly for debugging
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  }, [user, router]);

  const handleAnswer = (questionId, optionId) => {
    // Save the answer
    setAnswers({
      ...answers,
      [questionId]: optionId
    });

    // Animate out
    setAnimate(false);
    setAnimateDirection('slide-left');
    
    // Short delay before moving to next question
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setAnimate(true);
      } else {
        // Questionnaire completed
        completeQuestionnaire();
      }
    }, 400);
  };

  const completeQuestionnaire = () => {
    // Save answers and mark as completed
    localStorage.setItem('questionnaire_answers', JSON.stringify(answers));
    localStorage.setItem('questionnaire_completed', 'true');
    
    // Redirect to login
    router.push('/login');
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setAnimate(false);
      setAnimateDirection('slide-right');
      
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setAnimate(true);
      }, 400);
    }
  };

  const getCurrentBenefit = () => {
    return benefits[currentQuestion % benefits.length];
  };

  if (currentQuestion >= questions.length) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #f0f4ff, #e0e7ff)',
        color: '#1e293b'
      }}>
        <div style={{
          width: '4rem',
          height: '4rem',
          border: '4px solid #3b82f6',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '1rem', color: '#4b5563' }}>Preparing your experience...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const currentBenefit = getCurrentBenefit();

  // Inline styles as fallback in case Tailwind isn't loading properly
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'linear-gradient(to bottom right, #f0f4ff, #e0e7ff)',
      color: '#1e293b',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '36rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            color: '#1e40af'
          }}>
            Interview Assistant
          </h1>
          <p style={{ 
            fontSize: '1rem',
            color: '#3b82f6',
            opacity: '0.8'
          }}>
            Let&apos;s personalize your interview experience
          </p>
        </div>
        
        {/* Progress indicator */}
        <div style={{ position: 'relative', width: '100%', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '100%', 
            backgroundColor: '#e5e7eb', 
            borderRadius: '9999px', 
            height: '0.625rem',
            marginBottom: '0.5rem',
            overflow: 'hidden'
          }}>
            <div style={{ 
              background: 'linear-gradient(to right, #3b82f6, #4f46e5)',
              height: '0.625rem',
              borderRadius: '9999px',
              transition: 'width 0.7s ease-out',
              width: `${((currentQuestion + 1) / questions.length) * 100}%`
            }}></div>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '0.75rem', 
            color: '#6b7280', 
            padding: '0 0.25rem'
          }}>
            {[...Array(questions.length)].map((_, i) => (
              <div 
                key={i}
                style={{ 
                  width: '1rem', 
                  height: '1rem', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  backgroundColor: i < currentQuestion 
                    ? '#4f46e5' 
                    : i === currentQuestion 
                      ? 'white'
                      : '#e5e7eb',
                  color: i < currentQuestion ? 'white' : '#6b7280',
                  border: i === currentQuestion ? '2px solid #4f46e5' : 'none',
                  transform: i === currentQuestion ? 'scale(1.25)' : 'scale(1)',
                  fontSize: '0.75rem'
                }}
              >
                {i < currentQuestion ? "✓" : (i + 1)}
              </div>
            ))}
          </div>
        </div>

        {/* Question card */}
        <div style={{ 
          position: 'relative', 
          overflow: 'hidden',
          transform: animate 
            ? 'translateX(0)' 
            : animateDirection === 'slide-left' 
              ? 'translateX(-100%)' 
              : 'translateX(100%)',
          opacity: animate ? 1 : 0,
          transition: 'all 0.5s ease-out'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '2rem',
            border: '1px solid #f3f4f6'
          }}>
            {/* Question */}
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1.5rem', 
              color: '#1e293b'
            }}>
              {questions[currentQuestion].question}
            </h2>
            
            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {questions[currentQuestion].options.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(questions[currentQuestion].id, option.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '2px solid #f3f4f6',
                    backgroundColor: 'white',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    color: '#374151',
                    transform: 'scale(1)',
                    outline: 'none'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.backgroundColor = '#f0f7ff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#f3f4f6';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.99)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      width: '1.5rem',
                      height: '1.5rem',
                      marginRight: '0.75rem',
                      borderRadius: '50%',
                      backgroundColor: '#ebf5ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#3b82f6',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {option.id.toUpperCase()}
                    </span>
                    <span>{option.text}</span>
                  </span>
                </button>
              ))}
            </div>

            {/* Navigation controls */}
            <div style={{
              marginTop: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {currentQuestion > 0 ? (
                <button 
                  onClick={goToPreviousQuestion}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = '#1e40af';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = '#3b82f6';
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  <span style={{ marginLeft: '0.25rem' }}>Previous</span>
                </button>
              ) : (
                <div></div>  
              )}
              
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Benefit highlight */}
        <div style={{
          marginTop: '2rem',
          background: 'linear-gradient(to right, #2563eb, #4f46e5)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
          transform: 'scale(1)',
          transition: 'transform 0.5s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ marginRight: '1rem', marginTop: '0.25rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 22V7.5L12 2 4 7.5V22"/>
                  <path d="M2 22h20"/>
                  <path d="M12 14v4"/>
                  <path d="M12 11v.01"/>
                  <path d="M16 11v.01"/>
                  <path d="M8 11v.01"/>
                </svg>
              </div>
            </div>
            <div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                {currentBenefit.title}
              </h3>
              <p style={{ opacity: '0.9' }}>{currentBenefit.description}</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        html, body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        * {
          box-sizing: border-box;
        }
        
        button {
          font-family: inherit;
        }
        
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slide-out {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
} 