import React from 'react';
import { BotIcon } from './icons';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-background text-primary">
      <div className="flex items-center gap-4 animate-fade-in">
        <BotIcon className="h-16 w-16 text-accent animate-pulse" />
        <div>
            <h1 className="text-4xl font-bold">Gemini Agents</h1>
            <span className="text-sm font-semibold text-accent bg-accent/10 px-2 py-1 rounded-full border border-accent/20">beta</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;