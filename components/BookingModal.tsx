
import React, { useEffect, useState } from 'react';
import type { Mentor } from '../types';

interface BookingModalProps {
  mentor: Mentor;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ mentor, onClose }) => {
  const [view, setView] = useState<'options' | 'upi' | 'card'>('options');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });
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

  const handlePaymentSuccess = (method: string) => {
    alert(`Payment with ${method} successful! Your session with ${mentor.name} is confirmed.`);
    onClose();
  };
  
  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardDetails.number && cardDetails.expiry && cardDetails.cvc && cardDetails.name) {
      handlePaymentSuccess('Card');
    } else {
      alert("Please fill in all card details.");
    }
  };
  
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(upiId).then(() => {
      alert('UPI ID copied to clipboard!');
    });
  };

  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="absolute top-7 left-6 flex items-center text-sm font-medium text-muted-gray hover:text-white transition-colors z-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
    </button>
  );

  const renderContent = () => {
    switch(view) {
      case 'upi':
        return (
          <>
            <BackButton onClick={() => setView('options')} />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Session</h2>
              <p className="text-muted-gray mb-6">with <span className="font-semibold text-white">{mentor.name}</span></p>

              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                  <p className="text-sm text-muted-gray">You are about to book a 60-minute session for:</p>
                  <p className="text-4xl font-extrabold text-white my-2">INR {mentor.sessionPrice.toLocaleString('en-IN')}</p>
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
                      onClick={() => handlePaymentSuccess('UPI')}
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
          </>
        );
      case 'card':
        return (
          <>
            <BackButton onClick={() => setView('options')} />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Pay with Card</h2>
              <p className="text-muted-gray mt-1">Total: INR {mentor.sessionPrice.toLocaleString('en-IN')}</p>
            </div>
            <form onSubmit={handleCardSubmit} className="space-y-4 mt-6">
                <input type="text" name="number" value={cardDetails.number} onChange={handleCardChange} placeholder="Card Number" required className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition" />
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="expiry" value={cardDetails.expiry} onChange={handleCardChange} placeholder="MM / YY" required className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition" />
                    <input type="text" name="cvc" value={cardDetails.cvc} onChange={handleCardChange} placeholder="CVC" required className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition" />
                </div>
                <input type="text" name="name" value={cardDetails.name} onChange={handleCardChange} placeholder="Name on Card" required className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition" />
                <button type="submit" className="w-full text-center px-4 py-3 font-bold text-white bg-gradient-to-r from-aqua-green to-neon-purple rounded-lg shadow-lg hover:shadow-xl hover:shadow-neon-purple/40 transition-all duration-300 transform hover:-translate-y-1">
                    Pay INR {mentor.sessionPrice.toLocaleString('en-IN')}
                </button>
                 <button
                      type="button"
                      onClick={onClose}
                      className="w-full px-4 py-3 font-bold text-muted-gray bg-slate-700/50 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
                  >
                      Cancel
                  </button>
            </form>
          </>
        );
      case 'options':
      default:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Choose Payment Method</h2>
            <p className="text-muted-gray mt-1">Booking a session with <span className="text-white font-semibold">{mentor.name}</span></p>
            <div className="space-y-4 mt-8">
                <button
                    onClick={() => setView('upi')}
                    className="w-full flex items-center justify-center gap-3 text-left p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-electric-blue"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <span className="font-semibold text-white">Pay with UPI</span>
                </button>
                <button
                    onClick={() => setView('card')}
                    className="w-full flex items-center justify-center gap-3 text-left p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-aqua-green"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                    <span className="font-semibold text-white">Credit / Debit Card</span>
                </button>
            </div>
             <button
                onClick={onClose}
                className="w-full mt-6 px-4 py-3 font-bold text-muted-gray bg-transparent rounded-lg hover:bg-slate-700/50 hover:text-white transition-colors"
            >
                Cancel Booking
            </button>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-slide-in-fade"
      onClick={onClose}
    >
      <div 
        className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-electric-blue/20 w-full max-w-md p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close modal" className="absolute top-4 right-4 text-muted-gray hover:text-white transition-colors z-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        {renderContent()}
      </div>
    </div>
  );
};

export default BookingModal;
