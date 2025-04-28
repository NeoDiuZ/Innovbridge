'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Questions designed to entice users to want to use the interview bot
const questions = [
  {
    id: 1,
    text: "What type of job interviews are you preparing for right now?",
    options: [
      "Tech/Engineering roles",
      "Business/Management positions",
      "Entry-level/Graduate jobs",
      "Career transition to a new field",
      "Senior leadership/Executive roles"
    ]
  },
  {
    id: 2,
    text: "What's your biggest challenge during actual interviews?",
    options: [
      "Articulating my experience clearly and confidently",
      "Handling unexpected or technical questions",
      "Controlling nervousness and anxiety",
      "Knowing what the interviewer is looking for",
      "Showcasing my skills without sounding arrogant"
    ]
  },
  {
    id: 3,
    text: "How soon are you preparing for an upcoming interview?",
    options: [
      "This week - I have interviews scheduled",
      "Within the next month",
      "Not immediately, but want to be ready",
      "Just building skills for future opportunities",
      "Currently employed but exploring options"
    ]
  },
  {
    id: 4,
    text: "Which CoachBot feature would benefit you most?",
    options: [
      "Real-time feedback on my interview answers",
      "Personalized practice based on my industry/role",
      "Tips to improve my communication and delivery",
      "Targeted practice for my weak areas",
      "AI-powered mock interviews available 24/7"
    ]
  },
  {
    id: 5,
    text: "How would you like CoachBot to help you succeed?",
    options: [
      "Build confidence through repeated practice",
      "Provide expert insights for specific job types",
      "Help me stand out from other candidates",
      "Improve my storytelling and example sharing",
      "Prepare me for tough questions I'm afraid of"
    ]
  }
];

export default function Questionnaire({ onComplete, isModal = false }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
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
      // Call the completion callback with answers
      if (onComplete) {
        onComplete(answers);
      }
    }
  };

  // Skip questionnaire
  const handleSkip = () => {
    if (onComplete) {
      onComplete(null);
    }
  };

  const question = questions[currentQuestion];
  const isAnswered = answers[question.id] !== undefined;

  return (
    <div className={`w-full max-w-xl mx-auto ${isModal ? 'fixed inset-0 flex items-center justify-center bg-black/50 z-50' : ''}`}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100">
          <div 
            className="h-full bg-primary-600 transition-all duration-300" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="p-6 sm:p-8">
          {/* Question Header */}
          <div className="mb-6">
            <div className="text-sm text-secondary-500 mb-2">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <h2 className="text-xl font-bold text-secondary-900">
              {question.text}
            </h2>
          </div>
          
          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <div 
                key={index}
                onClick={() => handleSelect(question.id, option)}
                className={`p-4 rounded-lg border transition-all cursor-pointer flex items-center
                  ${answers[question.id] === option 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50'}`}
              >
                {/* Radio Button */}
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mr-3
                  ${answers[question.id] === option ? 'border-primary-600' : 'border-secondary-400'}`}>
                  {answers[question.id] === option && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-600"></div>
                  )}
                </div>
                
                {/* Option Text */}
                <span className={`text-base ${answers[question.id] === option ? 'text-secondary-900 font-medium' : 'text-secondary-700'}`}>
                  {option}
                </span>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="flex justify-between items-center">
            <button 
              onClick={handleSkip}
              className="text-secondary-500 hover:text-secondary-700 text-sm font-medium"
            >
              Skip for now
            </button>
            
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors
                ${isAnswered 
                  ? 'bg-primary-600 text-white hover:bg-primary-700' 
                  : 'bg-secondary-200 text-secondary-400 cursor-not-allowed'}`}
            >
              {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 