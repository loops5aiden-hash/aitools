import React from 'react';
import { BotIcon } from './icons';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-4 animate-fade-in justify-start">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-surface border border-white/10 flex items-center justify-center">
        <BotIcon className="w-5 h-5 text-accent" />
      </div>
      <div className="max-w-md md:max-w-2xl px-5 py-3 rounded-2xl bg-model-bubble text-primary">
        <div className="flex items-center justify-center space-x-1.5">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse-fast [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse-fast [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse-fast"></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;