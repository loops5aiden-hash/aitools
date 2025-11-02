
import React from 'react';
import { SunIcon, MoonIcon, SparklesIcon, ZapIcon, InfoIcon } from './icons';

interface SettingsScreenProps {
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onClearCustomData: () => void;
  onFullReset: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose, theme, onToggleTheme, onClearCustomData, onFullReset }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface/75 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8 w-full max-w-md" 
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">Settings</h1>
        
        <div className="space-y-4">
            <div className="bg-black/20 p-4 rounded-lg">
                <h2 className="font-semibold text-primary mb-3">Appearance</h2>
                <div className="flex items-center justify-between">
                    <p className="text-secondary">Theme</p>
                    <div className="flex items-center gap-2 bg-surface p-1 rounded-full border border-white/10">
                        <button onClick={onToggleTheme} className={`p-2 rounded-full ${theme === 'light' ? 'bg-accent text-background' : 'text-secondary'}`}><SunIcon className="w-5 h-5"/></button>
                        <button onClick={onToggleTheme} className={`p-2 rounded-full ${theme === 'dark' ? 'bg-accent text-background' : 'text-secondary'}`}><MoonIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            </div>

            <div className="bg-black/20 p-4 rounded-lg">
                <h2 className="font-semibold text-primary mb-3">Data Management</h2>
                <div className="space-y-3">
                    <button onClick={onClearCustomData} className="w-full text-left flex items-center gap-3 text-secondary hover:text-primary transition-colors">
                        <SparklesIcon className="w-5 h-5 text-accent"/>
                        <span>Clear Custom Agents & Tools</span>
                    </button>
                     <button onClick={onFullReset} className="w-full text-left flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors">
                        <ZapIcon className="w-5 h-5"/>
                        <span>Full App Reset</span>
                    </button>
                </div>
            </div>
            
            <div className="bg-black/20 p-4 rounded-lg">
                <h2 className="font-semibold text-primary mb-3">About</h2>
                <div className="space-y-2 text-secondary">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <InfoIcon className="w-5 h-5 text-accent" />
                            <span>App Version</span>
                        </div>
                        <span className="font-mono text-xs">1.0.0 (beta)</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-surface">
                        <div className="flex items-center gap-3">
                            <ZapIcon className="w-5 h-5 text-accent" />
                            <span>Beta Promotion</span>
                        </div>
                        <span className="font-mono text-xs font-semibold">25% OFF CREDITS</span>
                    </div>
                </div>
            </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 py-3 bg-accent text-background rounded-lg font-semibold hover:opacity-90 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-accent/70 focus:ring-offset-2 focus:ring-offset-surface"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
