'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InterviewQuestionnaire() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    role: '',
    experience: '',
    interviewType: '',
    focusAreas: []
  });

  const questions = {
    1: {
      question: "What role are you interviewing for?",
      type: "text",
      placeholder: "e.g., Software Engineer, Product Manager, etc."
    },
    2: {
      question: "What's your experience level?",
      type: "select",
      options: ["Entry Level", "Mid Level", "Senior Level", "Lead/Manager"]
    },
    3: {
      question: "What type of interview are you preparing for?",
      type: "select",
      options: ["Technical", "Behavioral", "Case Study", "General"]
    },
    4: {
      question: "What areas would you like to focus on? (Select multiple)",
      type: "multiselect",
      options: [
        "Technical Skills",
        "Problem Solving",
        "Communication",
        "Leadership",
        "Teamwork",
        "Project Management",
        "System Design",
        "Coding"
      ]
    }
  };

  const handleAnswer = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [Object.keys(prev)[step - 1]]: answer
    }));
    
    if (step < Object.keys(questions).length) {
      setStep(step + 1);
    } else {
      // Navigate to chat with the answers
      router.push(`/interview/chat?data=${encodeURIComponent(JSON.stringify(answers))}`);
    }
  };

  const currentQuestion = questions[step];

  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentQuestion.question}
            </h2>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${(step / Object.keys(questions).length) * 100}%` }}
              ></div>
            </div>
          </div>

          {currentQuestion.type === 'text' && (
            <input
              type="text"
              placeholder={currentQuestion.placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAnswer(e.target.value);
                }
              }}
            />
          )}

          {currentQuestion.type === 'select' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="w-full p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'multiselect' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    onChange={(e) => {
                      const newFocusAreas = e.target.checked
                        ? [...answers.focusAreas, option]
                        : answers.focusAreas.filter(area => area !== option);
                      setAnswers(prev => ({ ...prev, focusAreas: newFocusAreas }));
                    }}
                  />
                  <span className="ml-3">{option}</span>
                </label>
              ))}
              <button
                onClick={() => handleAnswer(answers.focusAreas)}
                className="mt-4 w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 