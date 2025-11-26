
import React, { useEffect, useState } from 'react';
import { PRO_FEATURES } from '../constants';

interface UpgradeModalProps {
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose }) => {
    const [view, setView] = useState<'features' | 'payment_options' | 'card' | 'crypto'>('features');
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });

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
        if (method === 'card') {
            alert('Payment successful! Welcome to SkillLink Pro.');
        } else {
            alert('Payment received! Your transaction is being confirmed on the blockchain. Welcome to SkillLink Pro!');
        }
        onClose();
    };
    
    const handleCardSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (cardDetails.number && cardDetails.expiry && cardDetails.cvc && cardDetails.name) {
            handlePaymentSuccess('card');
        } else {
            alert("Please fill in all card details.");
        }
    };
    
    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCardDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const renderHeader = (title: React.ReactNode, subtitle: string) => (
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <p className="text-muted-gray mt-1">{subtitle}</p>
            </div>
            <button onClick={onClose} aria-label="Close modal" className="text-muted-gray hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
    
    const BackButton = ({ onClick }: { onClick: () => void }) => (
        <button onClick={onClick} className="absolute top-7 left-6 flex items-center text-sm font-medium text-muted-gray hover:text-white transition-all active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
        </button>
    );

    const renderContent = () => {
        switch (view) {
            case 'payment_options':
                return (
                    <>
                        {renderHeader('Choose Payment Method', 'Select how you\'d like to pay.')}
                        <div className="mt-6 border-t border-slate-700 pt-6 relative">
                            <BackButton onClick={() => setView('features')} />
                            <div className="space-y-4 pt-8">
                                <button
                                    onClick={() => setView('card')}
                                    className="w-full flex items-center justify-center gap-3 text-left p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-aqua-green"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                                    <span className="font-semibold text-white">Credit / Debit Card</span>
                                </button>
                                <button
                                    onClick={() => setView('crypto')}
                                    className="w-full flex items-center justify-center gap-3 text-left p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-neon-purple"><path d="M10.333 8.002h3.334C15.533 8 16 8.467 16 10v4c0 1.533-.467 2-2.333 2h-3.334C8.467 16 8 15.533 8 14v-4c0-1.533.467-2 2.333-2z"/><path d="M12 8V7M12 17v-1M14.5 5.5l.707-.707M6.8 17.2l.707-.707M17.2 17.2l-.707-.707M5.5 5.5l.707.707M2 12h1M21 12h-1"/></svg>
                                    <span className="font-semibold text-white">Cryptocurrency (NOWPayments)</span>
                                </button>
                            </div>
                        </div>
                    </>
                );
            case 'card':
                return (
                    <>
                        {renderHeader('Pay with Card', 'Enter your card details.')}
                        <div className="mt-6 border-t border-slate-700 pt-6 relative">
                            <BackButton onClick={() => setView('payment_options')} />
                            <form onSubmit={handleCardSubmit} className="space-y-4 pt-8">
                                <div>
                                    <label htmlFor="card-number" className="sr-only">Card Number</label>
                                    <input type="text" id="card-number" name="number" value={cardDetails.number} onChange={handleCardChange} placeholder="Card Number" required className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" name="expiry" value={cardDetails.expiry} onChange={handleCardChange} placeholder="MM / YY" required className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition" />
                                    <input type="text" name="cvc" value={cardDetails.cvc} onChange={handleCardChange} placeholder="CVC" required className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition" />
                                </div>
                                <input type="text" name="name" value={cardDetails.name} onChange={handleCardChange} placeholder="Name on Card" required className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white focus:ring-2 focus:ring-electric-blue focus:outline-none transition" />
                                <button type="submit" className="w-full text-center px-4 py-3 font-bold text-white bg-gradient-to-r from-aqua-green to-neon-purple rounded-lg shadow-lg hover:shadow-xl hover:shadow-neon-purple/40 transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
                                    Pay INR 999
                                </button>
                            </form>
                        </div>
                    </>
                );
            case 'crypto':
                return (
                    <>
                        {renderHeader('Pay with Crypto', 'via NOWPayments')}
                        <div className="mt-6 border-t border-slate-700 pt-6 relative text-center">
                            <BackButton onClick={() => setView('payment_options')} />
                            <p className="text-muted-gray mb-4 pt-8">Scan the QR code or use the address below to pay <span className="font-bold text-white">~12 USDT</span>.</p>
                            <div className="p-4 bg-white rounded-lg inline-block">
                                <svg width="160" height="160" viewBox="0 0 33 33" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M0 0h11v11H0V0Zm2 2v7h7V2H2Zm13-2h11v11H15V0Zm2 2v7h7V2h-7ZM0 15h11v11H0V15Zm2 2v7h7v-7H2Zm22-2h-8v2h-2v2h2v2h2v-2h2v2h2v-2h-2v-2h-2v2h-2v-2Zm-2-2v2h2v-2h-2Zm-2 0h-2v2h2v-2Zm-2 6h2v2h-2v-2Zm2 0v2h2v-2h-2Zm0 2h-2v2h2v-2Zm-2 2v-2h-2v2h2Zm-2-2h-2v2h2v-2Zm-2 0v-2h-2v2h2Zm0-2h2v-2h-2v2Zm-2-2v2h-2v-2h2Zm2-2h2v-2h-2v2Zm2 0v2h2v-2h-2Zm2 2h2v-2h-2v2Zm0 2v2h2v-2h-2Zm-6 0h-2v2h2v-2Zm-2-2v-2h-2v2h2Zm-2 2h-2v2h2v-2Zm-2 2v-2h-2v2h2Zm4-4h2v-2h-2v2Zm6-11h-2v2h2V9Zm0 2v2h2V9h-2v2h-2v2h-2V9h2v2h2Zm-2-2h-2v2h2V9Zm-2 2v2h-2v-2h2Zm-2-2h-2v2h2V9Zm2-2v2h-2V7h2Zm2-2h-2v2h2V5Zm-2 0v2h-2V5h2Zm-2-2h-2v2h2V3Zm-2 0v2h-2V3h2ZM9 5H7V3h2v2Zm0 2v2H7V7h2Zm0 2H7v2h2V9ZM7 5H5V3h2v2Zm0 2v2H5V7h2Zm0 2H5v2h2V9ZM5 5H3V3h2v2Zm0 2v2H3V7h2Zm0 2H3v2h2V9ZM9 17H7v-2h2v2Zm0 2v2H7v-2h2Zm0 2H7v2h2v-2Zm-2 2v-2H5v2h2Zm-2-2h-2v2h2v-2Zm0-2v-2H3v2h2Zm2-2h2v-2H7v2Zm-2-2v2H3v-2h2Zm2-2H3v2h2v-2h2ZM24 0h9v9h-9V0Zm2 2v5h5V2h-5ZM0 31h9v-9H0v9Zm2-7v5h5v-5H2Zm11-9h9v9h-9v-9Zm2 2v5h5v-5h-5Z" fill="#000"/></svg>
                            </div>
                            <div className="mt-4 flex items-center justify-between p-2 rounded-lg border border-slate-600 bg-slate-900">
                                <span className="font-mono text-xs sm:text-sm text-white truncate">0x1234567890abcdef1234567890abcdef12345678</span>
                                <button onClick={() => navigator.clipboard.writeText('0x1234567890abcdef1234567890abcdef12345678')} className="px-3 py-1.5 border border-electric-blue text-xs font-medium rounded-lg text-electric-blue hover:bg-electric-blue hover:text-white transition-all active:scale-95">
                                    Copy
                                </button>
                            </div>
                            <button onClick={() => handlePaymentSuccess('crypto')} className="mt-6 w-full text-center px-4 py-3 font-bold text-white bg-gradient-to-r from-aqua-green to-neon-purple rounded-lg shadow-lg hover:shadow-xl hover:shadow-neon-purple/40 transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
                                I Have Paid
                            </button>
                        </div>
                    </>
                );
            case 'features':
            default:
                return (
                    <>
                        {renderHeader(
                            <>Unlock <span className="bg-gradient-to-r from-aqua-green to-neon-purple text-transparent bg-clip-text">SkillLink Pro</span></>,
                            'Supercharge your learning journey.'
                        )}
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
                                onClick={() => setView('payment_options')}
                                className="w-full text-center px-4 py-3 font-bold text-white bg-gradient-to-r from-aqua-green to-neon-purple rounded-lg shadow-lg hover:shadow-xl hover:shadow-neon-purple/40 transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
                            >
                                Upgrade for INR 999/month
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full px-4 py-3 font-bold text-muted-gray bg-slate-700/50 rounded-lg hover:bg-slate-700 hover:text-white transition-all active:scale-95"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </>
                );
        }
    }


    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-slide-in-fade"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-neon-purple/20 w-full max-w-lg p-6 sm:p-8 text-left"
                onClick={(e) => e.stopPropagation()}
            >
                {renderContent()}
            </div>
        </div>
    );
};

export default UpgradeModal;
