import React from 'react';
import { Badge } from '../types';

interface AchievementToastProps {
  badge: Badge;
  onClose: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ badge, onClose }) => {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-slide-in-bottom">
      <div className="flex items-center gap-4 bg-gradient-to-r from-slate-900 to-dark-slate border border-aqua-green p-4 rounded-xl shadow-2xl shadow-aqua-green/20 min-w-[320px]">
        <span className="text-4xl">{badge.icon}</span>
        <div>
          <h3 className="font-bold text-aqua-green">Badge Unlocked!</h3>
          <p className="text-white font-semibold">{badge.name}</p>
        </div>
        <button onClick={onClose} className="ml-auto text-muted-gray hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AchievementToast;
