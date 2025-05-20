'use client';
import React, { useState } from 'react';
import Button from './ui/Button'; // Assuming you have a Button component

export default function EmailPopup({ isOpen, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email cannot be empty.');
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(email);
      // onClose(); // Optionally close on successful submit, or let parent handle
    } catch (err) {
      setError(err.message || 'Failed to send summary. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Get Your Session Summary</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close popup"
          >
            &times;
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Enter your email below to receive a summary of your coaching session, including key insights and recommendations.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="you@example.com"
              required
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Summary'}
            </Button>
            <Button
              type="button"
              variant="secondary" // Assuming you have a secondary variant
              onClick={onClose}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              No Thanks
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 