import React from 'react';
import { Logo } from '../constants';

const Onboarding: React.FC<{onComplete: () => void}> = ({ onComplete }) => {
  return (
    <div className="min-h-screen bg-dark-slate flex flex-col items-center justify-center text-center p-4 relative overflow-hidden animate-slide-in-fade">
      
      {/* Animated background glows for a more dynamic feel */}
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-electric-blue/20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-neon-purple/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <main className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-aqua-green drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"><path d="M12 3L9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3z"/></svg>
            <Logo className="h-16 w-auto" />
        </div>
        
        <p className="mt-6 text-2xl font-medium text-muted-gray tracking-wide">
          Connect. Learn. Grow in Tech.
        </p>
      </main>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-sm px-4" style={{ animationDelay: '0.5s' }}>
        <div className="space-y-4">
          <button 
            onClick={onComplete}
            className="w-full text-lg font-semibold text-white px-8 py-4 rounded-lg bg-gradient-to-r from-electric-blue to-neon-purple shadow-lg hover:shadow-xl hover:shadow-electric-blue/40 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-dark-slate focus:ring-electric-blue"
            aria-label="Login with Gmail"
          >
            Login with Gmail
          </button>
          <button 
            onClick={onComplete}
            className="w-full text-lg font-semibold text-white px-8 py-4 rounded-lg bg-gradient-to-r from-electric-blue to-neon-purple shadow-lg hover:shadow-xl hover:shadow-neon-purple/40 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-dark-slate focus:ring-neon-purple"
            aria-label="Sign Up for free"
          >
            Sign Up (Free)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;