'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from './components/ui/Button';

export default function LandingPage() {
  const router = useRouter();

  const bots = [
    {
      id: 'coach',
      name: 'CoachBot',
      description: 'Your personal AI coach to help you achieve your goals and unlock your potential',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.4 7.34L16.66 4.6A2 2 0 0 0 14 4.53l-9 9a2 2 0 0 0-.57 1.21L4 18.91a1 1 0 0 0 .29.8A1 1 0 0 0 5 20h.09l4.17-.38a2 2 0 0 0 1.21-.57l9-9a1.92 1.92 0 0 0-.07-2.71z" fill="currentColor"/>
        </svg>
      ),
      path: '/questionnaire'
    },
    {
      id: 'interview',
      name: 'InterviewBot',
      description: 'Practice interviews and get personalized feedback to ace your next interview',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z" fill="currentColor"/>
          <path d="M6 10h12v2H6v-2zm0 4h8v2H6v-2z" fill="currentColor"/>
        </svg>
      ),
      path: '/interview/questionnaire'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col justify-center items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-secondary-900 mb-4">
          Welcome to InnovBridge
        </h1>
        <p className="text-xl text-secondary-600">
          Choose your AI assistant to help you achieve your goals
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {bots.map((bot) => (
          <motion.div
            key={bot.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-subtle p-6 hover:shadow-medium transition-shadow duration-200"
          >
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center text-white mr-4">
                {bot.icon}
              </div>
              <h2 className="text-xl font-semibold text-secondary-900">{bot.name}</h2>
            </div>
            <p className="text-secondary-600 mb-6">{bot.description}</p>
            <Button
              onClick={() => router.push(bot.path)}
              className="w-full"
            >
              Get Started
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}