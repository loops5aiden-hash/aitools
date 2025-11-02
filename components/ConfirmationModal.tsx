import React from 'react';

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onCancel}>
      <div 
        className="bg-surface/75 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8 w-full max-w-sm" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-primary mb-3">{title}</h2>
        <p className="text-secondary mb-6">{message}</p>
        <div className="flex gap-4 w-full">
          <button
            onClick={onCancel}
            className="w-full py-3 bg-white/10 text-primary rounded-lg font-semibold hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-surface"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;