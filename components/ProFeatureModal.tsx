
import React, { useEffect } from 'react';
import type { ProFeature } from '../types';

interface ProFeatureModalProps {
  feature: ProFeature;
  onClose: () => void;
}

const ProFeatureModal: React.FC<ProFeatureModalProps> = ({ feature, onClose }) => {
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
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-electric-blue/20 w-full max-w-lg p-6 sm:p-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
             <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-aqua-green/20 text-aqua-green">
                {feature.icon}
             </div>
             <div>
                <h2 className="text-2xl font-bold text-white">{feature.title}</h2>
                <p className="text-muted-gray">{feature.description}</p>
             </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="text-muted-gray hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-6 border-t border-slate-700 pt-6">
            <h3 className="font-semibold text-white mb-2">Feature Details</h3>
            <p className="text-muted-gray leading-relaxed">{feature.longDescription}</p>
        </div>

        <div className="mt-8">
            <button
                onClick={() => {
                    alert('Upgrade to Pro feature coming soon!');
                    onClose();
                }}
                className="w-full block text-center px-4 py-3 font-bold text-white bg-gradient-to-r from-aqua-green to-neon-purple rounded-lg shadow-lg hover:shadow-xl hover:shadow-neon-purple/40 transition-all duration-300 transform hover:-translate-y-1"
            >
                Upgrade to Pro to Access
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProFeatureModal;
