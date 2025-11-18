import React, { useEffect } from 'react';

interface ChatModalProps {
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ onClose }) => {
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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-aqua-green drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mt-4">Mentor Chat Coming Soon!</h2>
        <p className="text-muted-gray mt-2">Get ready for direct, real-time conversations with your mentor during live sessions. Ask questions, get instant feedback, and collaborate seamlessly. This feature is under development.</p>

        <div className="mt-8">
            <button
                onClick={onClose}
                className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg shadow-lg hover:shadow-xl hover:shadow-electric-blue/40 transition-all duration-300 transform hover:-translate-y-1"
            >
                Sounds Good!
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
