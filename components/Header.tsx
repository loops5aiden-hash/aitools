import React from 'react';
import { UserIcon, SettingsIcon, ZapIcon } from './icons';

interface HeaderProps {
    onOpenProfile: () => void;
    onOpenSettings: () => void;
    credits: number;
    theme: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({ onOpenProfile, onOpenSettings, credits, theme }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-surface bg-background/50 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-primary">Gemini Agents</h1>
        <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full text-accent bg-accent/10 border border-accent/20">
            <ZapIcon className="w-3 h-3" />
            <span>{credits}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenProfile}
          className="p-2 rounded-full text-secondary hover:bg-surface hover:text-primary transition-colors duration-200"
          aria-label="Open Profile"
        >
          <UserIcon className="w-6 h-6" />
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full text-secondary hover:bg-surface hover:text-primary transition-colors duration-200"
          aria-label="Open Settings"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;