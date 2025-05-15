'use client';

import React, { useState } from 'react';

export default function RatingInput({ maxRating = 10, onSubmit }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(0);

  const handleRatingClick = (rating) => {
    setCurrentRating(rating);
    if (onSubmit) {
      onSubmit(rating);
    }
  };

  return (
    <div className="my-3 p-3 bg-secondary-100 rounded-lg shadow">
      <p className="text-sm text-secondary-700 mb-2 text-center">Rate your session:</p>
      <div className="flex justify-center items-center space-x-1">
        {[...Array(maxRating)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <button
              key={ratingValue}
              type="button"
              className={`
                w-8 h-8 rounded-full text-sm font-medium transition-colors duration-150
                ${ratingValue <= (hoverRating || currentRating)
                  ? 'bg-primary-500 text-white' 
                  : 'bg-secondary-200 hover:bg-secondary-300 text-secondary-700'
                }
                ${currentRating > 0 ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
              onClick={() => handleRatingClick(ratingValue)}
              onMouseEnter={() => !currentRating && setHoverRating(ratingValue)}
              onMouseLeave={() => !currentRating && setHoverRating(0)}
              disabled={currentRating > 0}
            >
              {ratingValue}
            </button>
          );
        })}
      </div>
      {currentRating > 0 && (
        <p className="text-xs text-primary-600 mt-2 text-center">Thank you for your feedback!</p>
      )}
    </div>
  );
} 