
import React, { useEffect } from 'react';
import type { Mentor } from '../types';

interface BookingModalProps {
  mentor: Mentor;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ mentor, onClose }) => {
  const upiId = '76679264@upi';

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

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId).then(() => {
      alert('UPI ID copied to clipboard!');
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-slide-in-fade"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-electric-blue/20 w-full max-w-md p-6 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Session</h2>
        <p className="text-muted-gray mb-6">with <span className="font-semibold text-white">{mentor.name}</span></p>

        <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
            <p className="text-sm text-muted-gray">You are about to book a 60-minute session for:</p>
            <p className="text-4xl font-extrabold text-white my-2">₹{mentor.sessionPrice.toLocaleString('en-IN')}</p>
            <p className="text-sm text-muted-gray">Please complete the payment using the UPI ID below. Your booking will be confirmed automatically.</p>

            <div className="mt-6 flex items-center justify-between p-3 rounded-lg border border-slate-600">
                <span className="font-mono text-lg text-white tracking-wider">{upiId}</span>
                <button 
                    onClick={handleCopy}
                    className="px-3 py-1.5 border border-electric-blue text-xs font-medium rounded-lg text-electric-blue hover:bg-electric-blue hover:text-white transition-colors"
                >
                    Copy
                </button>
            </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
                onClick={onClose}
                className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg shadow-lg hover:shadow-xl hover:shadow-electric-blue/40 transition-all duration-300 transform hover:-translate-y-1"
            >
                Open UPI App & Pay
            </button>
            <button
                onClick={onClose}
                className="w-full px-4 py-3 font-bold text-muted-gray bg-slate-700/50 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
