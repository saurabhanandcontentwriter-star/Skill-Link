import React, { useState, useEffect } from 'react';
import { Workshop } from '../types';
import ChatModal from './ChatModal';

interface LiveSessionProps {
  workshop: Workshop;
  onBack: () => void;
}

const CountdownTimer: React.FC<{ targetDate: string }> = ({ targetDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents: React.ReactElement[] = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval] && ['days', 'hours', 'minutes'].includes(interval)) {
           return;
        }
        timerComponents.push(
            <div key={interval} className="text-center">
                <span className="text-4xl sm:text-6xl font-bold text-white tracking-wider font-mono">
                    {String(timeLeft[interval] || '0').padStart(2, '0')}
                </span>
                <span className="block text-sm text-muted-gray uppercase">{interval}</span>
            </div>
        );
    });

    return (
        <div className="flex justify-center space-x-4 sm:space-x-8">
            {timerComponents.length ? timerComponents : <span className="text-3xl font-bold text-aqua-green">Session is Live!</span>}
        </div>
    );
};

const LiveSession: React.FC<LiveSessionProps> = ({ workshop, onBack }) => {
    const isSessionLive = +new Date(workshop.date) - +new Date() <= 0;
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);

    return (
        <div className="animate-slide-in-fade">
            <button onClick={onBack} className="mb-6 flex items-center text-sm font-medium text-muted-gray hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
            </button>

            <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700 rounded-2xl p-8 sm:p-12 text-center shadow-2xl shadow-neon-purple/10">
                <span className="text-sm font-semibold bg-neon-purple/20 text-neon-purple px-3 py-1 rounded-full">{workshop.topic}</span>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4">{workshop.title}</h1>
                <p className="text-muted-gray text-lg mt-2">with {workshop.speaker}</p>
                
                <div className="my-12">
                    <CountdownTimer targetDate={workshop.date} />
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <a
                        href="https://meet.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white rounded-lg bg-gradient-to-r from-electric-blue to-neon-purple shadow-lg transition-all duration-300 transform ${
                            isSessionLive 
                            ? 'hover:-translate-y-1 hover:shadow-xl hover:shadow-electric-blue/40 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-dark-slate focus:ring-electric-blue' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                        aria-disabled={!isSessionLive}
                    >
                        Join via Google Meet
                    </a>
                     <button 
                        onClick={() => setIsChatModalOpen(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-electric-blue text-base font-medium rounded-lg text-electric-blue bg-slate-800/20 hover:bg-electric-blue hover:text-white transition-colors"
                    >
                       Chat with Mentor
                    </button>
                </div>
            </div>
            {isChatModalOpen && <ChatModal onClose={() => setIsChatModalOpen(false)} />}
        </div>
    );
};

export default LiveSession;