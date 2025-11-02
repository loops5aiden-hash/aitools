import React, { useState } from 'react';
import type { User } from '../types';
import { BotIcon } from './icons';

interface OnboardingFlowProps {
  onComplete: (user: User) => void;
}

const AVATAR_COLORS = [
  '#D4AF37', // Gold
  '#2563eb', // blue-600
  '#db2777', // pink-600
  '#16a34a', // green-600
  '#7c3aed', // violet-600
];

const UserAvatarPreview: React.FC<{ name: string; color: string }> = ({ name, color }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-white text-3xl transition-colors duration-300 shadow-lg"
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  );
};

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [color, setColor] = useState(AVATAR_COLORS[0]);

  const handleNext = () => setStep(step + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete({ name: name.trim(), color });
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center animate-fade-in-subtle">
            <div className="flex justify-center items-center gap-3 mb-6">
              <BotIcon className="h-12 w-12 text-accent" />
              <h1 className="text-3xl font-bold">Welcome to Gemini Agents</h1>
            </div>
            <p className="text-secondary mb-8">Your personal, elegant AI-powered companion.</p>
            <button
              onClick={handleNext}
              className="w-full py-3 bg-accent text-background rounded-lg font-semibold hover:opacity-90 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-accent/70 focus:ring-offset-2 focus:ring-offset-background"
            >
              Get Started
            </button>
          </div>
        );
      case 2:
        return (
          <div className="text-center animate-fade-in-subtle">
            <h1 className="text-2xl font-bold mb-3">Personalize Your Profile</h1>
            <p className="text-secondary mb-8">Choose your name and an avatar color.</p>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
              <UserAvatarPreview name={name} color={color} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-surface/75 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-3 text-primary text-center focus:outline-none focus:ring-2 focus:ring-accent/70"
                required
                aria-label="Your Name"
              />
              <div className="flex justify-center gap-3">
                {AVATAR_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform duration-200 ${color === c ? 'ring-2 ring-offset-2 ring-offset-background ring-accent scale-110' : 'ring-1 ring-white/10'}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-3 mt-2 bg-accent text-background rounded-lg font-semibold hover:opacity-90 transition-opacity duration-200 disabled:bg-surface disabled:text-secondary disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent/70 focus:ring-offset-2 focus:ring-offset-background"
              >
                Start Chatting
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-background text-primary p-4">
      <div className="w-full max-w-sm">
        {renderStep()}
      </div>
    </div>
  );
};

export default OnboardingFlow;