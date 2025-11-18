import React, { useState, useCallback } from 'react';
import { getGroundedAnswer } from '../services/geminiService';
import { GroundedResponse } from '../types';

const Hero: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<GroundedResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const examplePrompts = [
    'What is a Large Language Model?',
    'Compare DeFi and TradFi',
    'Explain Zero-Knowledge Proofs',
  ];

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await getGroundedAnswer(prompt);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <section className="text-center py-16 sm:py-20">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
        Your Gateway to <span className="bg-gradient-to-r from-electric-blue to-neon-purple text-transparent bg-clip-text">AI & Web3 Mastery</span>
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-gray">
        Find mentors, master new skills, and get real-time, accurate answers to your toughest questions.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 max-w-xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about the latest AI models, Web3 trends, etc."
            className="flex-grow w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-electric-blue to-neon-purple transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-dark-slate focus:ring-electric-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              'Ask Gemini'
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap justify-center items-center gap-3 text-sm">
        <span className="text-muted-gray font-medium">Try asking:</span>
        {examplePrompts.map((p) => (
            <button
                key={p}
                type="button"
                onClick={() => handleExampleClick(p)}
                className="px-3 py-1 bg-slate-800/60 text-muted-gray rounded-full border border-slate-700 hover:bg-slate-700/80 hover:text-white hover:border-aqua-green/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-slate focus:ring-aqua-green"
            >
                {p}
            </button>
        ))}
      </div>

      <div className="mt-10 max-w-3xl mx-auto text-left">
        {error && <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{error}</div>}
        {result && (
          <div className="p-6 bg-slate-800/30 backdrop-blur-md border border-slate-700 rounded-lg shadow-lg animate-slide-in-fade">
            <p className="text-white whitespace-pre-wrap leading-relaxed">{result.text}</p>
            {result.sources.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-700">
                <h3 className="text-sm font-semibold text-muted-gray uppercase tracking-wider">Sources</h3>
                <ul className="mt-3 space-y-2">
                  {result.sources.map((source, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center text-xs bg-slate-700 text-aqua-green rounded-full mr-3">{index + 1}</span>
                      <a 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-aqua-green hover:text-cyan-300 hover:underline break-all"
                      >
                        {source.title || source.uri}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;