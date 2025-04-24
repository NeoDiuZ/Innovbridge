'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Questions designed to entice users to want to use the interview bot
const questions = [
  {
    id: 1,
    text: "What's your biggest challenge when preparing for interviews?",
    options: [
      "Coming up with good responses to common questions",
      "Handling unexpected or difficult questions",
      "Managing interview anxiety",
      "Practicing without real feedback",
      "Tailoring answers to specific roles/companies"
    ]
  },
  {
    id: 2,
    text: "How often do you practice for interviews?",
    options: [
      "Only right before an interview",
      "Once or twice before an important interview",
      "Regularly, but not with structured feedback",
      "I rarely practice formally",
      "I have a systematic practice routine"
    ]
  },
  {
    id: 3,
    text: "What would help you most with your interview preparation?",
    options: [
      "Instant feedback on my responses",
      "Access to a large library of interview questions",
      "Industry-specific coaching tips",
      "Flexible practice that fits my schedule",
      "Ability to track my improvement over time"
    ]
  },
  {
    id: 4,
    text: "How valuable would it be to have an AI coach available 24/7 for interview practice?",
    options: [
      "Extremely valuable - I'd use it regularly",
      "Very valuable - especially before important interviews",
      "Somewhat valuable - I'd try it occasionally",
      "Slightly valuable - I prefer human coaching",
      "Not sure - I'd need to experience it first"
    ]
  },
  {
    id: 5,
    text: "What's your preferred way to improve your interviewing skills?",
    options: [
      "Practice with real-time feedback",
      "Learning from expert tips and strategies",
      "Reviewing recordings of my practice sessions",
      "Reading interview guides and books",
      "Role-playing with friends/colleagues"
    ]
  }
];

export default function Questionnaire({ onComplete, isModal = false }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const router = useRouter();

  // Handle selecting an option
  const handleSelect = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option
    });
  };

  // Handle next question or completion
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Mark as completed and store in localStorage
      localStorage.setItem('questionnaire_completed', 'true');
      localStorage.setItem('questionnaire_answers', JSON.stringify(answers));
      setIsCompleted(true);
      
      // Call the completion callback
      if (onComplete) {
        onComplete(answers);
      }
    }
  };

  // Skip questionnaire
  const handleSkip = () => {
    localStorage.setItem('questionnaire_completed', 'true');
    if (onComplete) {
      onComplete(null);
    }
  };

  // If already completed, don't show
  if (isCompleted) {
    return null;
  }

  const question = questions[currentQuestion];
  const isAnswered = answers[question.id] !== undefined;

  const containerStyles = isModal ? {
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    zIndex: 9999
  } : {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto'
  };

  return (
    <div style={containerStyles}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        width: '100%', 
        maxWidth: '500px', 
        margin: '0 16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Progress Bar */}
        <div style={{ 
          height: '4px', 
          width: '100%', 
          backgroundColor: '#f3f4f6'
        }}>
          <div style={{ 
            height: '100%', 
            backgroundColor: '#3b82f6', 
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            transition: 'width 0.3s ease-out'
          }}></div>
        </div>
        
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              marginBottom: '8px' 
            }}>
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: '#111827',
              margin: 0
            }}>
              {question.text}
            </h2>
          </div>
          
          {/* Options */}
          <div style={{ marginBottom: '24px' }}>
            {question.options.map((option, index) => (
              <div 
                key={index}
                onClick={() => handleSelect(question.id, option)}
                style={{ 
                  padding: '12px 16px',
                  marginBottom: '8px', 
                  border: `1px solid ${answers[question.id] === option ? '#3b82f6' : '#d1d5db'}`,
                  borderRadius: '6px',
                  backgroundColor: answers[question.id] === option ? '#eff6ff' : 'white', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {/* Radio Button Circle */}
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${answers[question.id] === option ? '#3b82f6' : '#9ca3af'}`,
                  backgroundColor: 'white',
                  marginRight: '12px',
                  flexShrink: 0,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {answers[question.id] === option && (
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6'
                    }}></div>
                  )}
                </div>
                
                {/* Option Text */}
                <span style={{ 
                  color: answers[question.id] === option ? '#111827' : '#4b5563',
                  fontWeight: answers[question.id] === option ? '500' : 'normal',
                  fontSize: '15px'
                }}>
                  {option}
                </span>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button 
              onClick={handleSkip}
              style={{
                background: 'none', 
                border: 'none', 
                color: '#6b7280', 
                fontSize: '14px',
                cursor: 'pointer',
                padding: '8px 16px'
              }}
            >
              Skip for now
            </button>
            
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              style={{
                padding: '8px 16px',
                backgroundColor: isAnswered ? '#3b82f6' : '#e5e7eb',
                color: isAnswered ? 'white' : '#9ca3af',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: isAnswered ? 'pointer' : 'not-allowed'
              }}
            >
              {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 