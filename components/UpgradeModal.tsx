
import React, { useEffect } from 'react';
import { PRO_FEATURES } from '../constants';

interface UpgradeModalProps {
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose }) => {
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
                className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-neon-purple/20 w-full max-w-lg p-6 sm:p-8 text-left"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Unlock <span className="bg-gradient-to-r from-aqua-green to-neon-purple text-transparent bg-clip-text">SkillLink Pro</span></h2>
                        <p className="text-muted-gray mt-1">Supercharge your learning journey.</p>
                    </div>
                    <button onClick={onClose} aria-label="Close modal" className="text-muted-gray hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="mt-6 border-t border-slate-700 pt-6 space-y-4">
                    {PRO_FEATURES.map((feature) => (
                        <div key={feature.title} className="flex items-center gap-4">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-aqua-green/20 text-aqua-green">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{feature.title}</h3>
                                <p className="text-sm text-muted-gray">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => {
                            alert('Payment gateway integration coming soon!');
                            onClose();
                        }}
                        className="w-full text-center px-4 py-3 font-bold text-white bg-gradient-to-r from-aqua-green to-neon-purple rounded-lg shadow-lg hover:shadow-xl hover:shadow-neon-purple/40 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        Upgrade for ₹999/month
                    </button>
                     <button
                        onClick={onClose}
                        className="w-full px-4 py-3 font-bold text-muted-gray bg-slate-700/50 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
