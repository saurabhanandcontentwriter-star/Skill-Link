import React from 'react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'md' }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  const starSizeClass = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl';
  const textSizeClass = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';
  
  return (
    <div className="flex items-center" aria-label={`Rating: ${rating} out of 5 stars`}>
      {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className={`text-yellow-400 ${starSizeClass}`}>⭐</span>)}
      {halfStar && <span className={`text-yellow-400 ${starSizeClass}`}>☆</span>}
      {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className={`text-gray-500 ${starSizeClass}`}>☆</span>)}
       <span className={`ml-2 text-muted-gray font-bold ${textSizeClass}`}>{rating.toFixed(1)}</span>
    </div>
  );
};

export default StarRating;
