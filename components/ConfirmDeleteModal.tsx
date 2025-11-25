import React, { useEffect } from 'react';

interface ConfirmDeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onConfirm, onCancel }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-slide-in-fade"
      onClick={onCancel}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-red-500/20 w-full max-w-sm p-6 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mt-4">Delete Task?</h2>
        <p className="text-muted-gray mt-2">Are you sure you want to delete this task? This action cannot be undone.</p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onConfirm}
            className="w-full px-4 py-3 font-bold text-white bg-red-600 rounded-lg shadow-lg hover:bg-red-700 transition-colors transform hover:-translate-y-1"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="w-full px-4 py-3 font-bold text-muted-gray bg-slate-700/50 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
