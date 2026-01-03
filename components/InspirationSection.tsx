
import React, { useState, useEffect } from 'react';
import { TECH_QUOTES } from '../constants';

const InspirationSection: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const rotateQuote = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % TECH_QUOTES.length);
      setIsVisible(true);
    }, 500);
  };

  useEffect(() => {
    const interval = setInterval(rotateQuote, 10000); // Auto-rotate every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const quote = TECH_QUOTES[index];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-slate-800/20 backdrop-blur-[2px] rounded-3xl -z-10 border border-slate-700/50"></div>
      
      {/* Decorative SVG Quote Marks */}
      <div className="absolute top-4 left-6 opacity-10 select-none">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className="text-electric-blue">
          <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L14.017 3C11.2556 3 9.017 5.23858 9.017 8V15C9.017 18.3137 11.7033 21 15.017 21L14.017 21ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H7.017C5.91243 8 5.017 7.10457 5.017 6V3L5.017 3C2.25558 3 0.017 5.23858 0.017 8V15C0.017 18.3137 2.7033 21 6.017 21L5.017 21Z" />
        </svg>
      </div>

      <div className="px-8 py-10 sm:px-16 sm:py-12 flex flex-col items-center justify-center text-center">
        <div className={`transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <blockquote className="max-w-3xl">
            <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-white italic leading-relaxed">
              "{quote.text}"
            </p>
            <footer className="mt-6 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-neon-purple/50"></div>
              <cite className="text-muted-gray font-bold uppercase tracking-[0.2em] text-sm not-italic">
                {quote.author}
              </cite>
              <div className="h-px w-8 bg-neon-purple/50"></div>
            </footer>
          </blockquote>
        </div>

        <button 
          onClick={rotateQuote}
          className="mt-8 text-xs font-bold text-muted-gray hover:text-aqua-green uppercase tracking-widest transition-colors flex items-center gap-2 group active:scale-95"
          aria-label="New Inspiration"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-180 transition-transform duration-500"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
          Next Quote
        </button>
      </div>
    </section>
  );
};

export default InspirationSection;
