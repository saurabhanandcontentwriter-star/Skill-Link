
import React, { useEffect } from 'react';

interface ChallengeModalProps {
  onClose: () => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-slide-in-fade"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-electric-blue/20 w-full max-w-md p-6 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center text-electric-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mt-4">Coding Challenges Are Coming Soon!</h2>
        <p className="text-muted-gray mt-2">Get ready to put your skills to the test, compete with the community, and win exclusive prizes. Stay tuned for our official launch!</p>
        
        <div className="mt-8">
            <button
                onClick={onClose}
                className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg shadow-lg hover:shadow-xl hover:shadow-electric-blue/40 transition-all duration-300 transform hover:-translate-y-1"
            >
                Got It, Can't Wait!
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;
