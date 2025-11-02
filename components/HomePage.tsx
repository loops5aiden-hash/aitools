import React from 'react';
import type { User } from '../types';
import type { CurrentScreen } from '../App';
import { BotIcon, SparklesIcon, LayoutTemplateIcon, StoreIcon, FolderIcon, TerminalIcon } from './icons';

interface HomePageProps {
  user: User;
  onNavigate: (screen: CurrentScreen) => void;
}

const AppButton: React.FC<{onClick: () => void, icon: React.ReactNode, title: string, description: string, ariaLabel: string}> = ({ onClick, icon, title, description, ariaLabel }) => (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center w-full aspect-square bg-surface/75 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg hover:shadow-2xl hover:border-accent/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-accent/50"
      aria-label={ariaLabel}
    >
      <div className="mb-2 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <span className="text-base font-semibold text-primary">{title}</span>
      <p className="text-xs text-secondary px-2 text-center">{description}</p>
    </button>
);

const HomePage: React.FC<HomePageProps> = ({ user, onNavigate }) => {
  return (
    <main className="flex flex-1 flex-col justify-center p-4 md:p-6 text-center overflow-y-auto">
      <div className="animate-fade-in-subtle">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">Welcome back, {user.name}</h1>
        <p className="text-lg text-secondary mt-2 mb-8">Select an application to begin.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <AppButton
                onClick={() => onNavigate('chat')}
                icon={<BotIcon className="w-12 h-12 md:w-14 md:h-14 text-accent" />}
                title="Gemini Agent"
                description="Chat with an AI assistant."
                ariaLabel="Start a new chat with Gemini Agent"
            />
             <AppButton
                onClick={() => onNavigate('projects')}
                icon={<FolderIcon className="w-12 h-12 md:w-14 md:h-14 text-accent" />}
                title="Projects"
                description="Organize your AI generations."
                ariaLabel="Open PromptFlow Projects"
            />
            <AppButton
                onClick={() => onNavigate('terminal')}
                icon={<TerminalIcon className="w-12 h-12 md:w-14 md:h-14 text-accent" />}
                title="Terminal"
                description="Use commands to create."
                ariaLabel="Open Terminal"
            />
            <AppButton
                onClick={() => onNavigate('makerStudio')}
                icon={<SparklesIcon className="w-12 h-12 md:w-14 md:h-14 text-accent" />}
                title="Maker Studio"
                description="Create custom agents & tools."
                ariaLabel="Open the Agent and Tool Maker Studio"
            />
            <AppButton
                onClick={() => onNavigate('builder')}
                icon={<LayoutTemplateIcon className="w-12 h-12 md:w-14 md:h-14 text-accent" />}
                title="Multi-Agent Builder"
                description="Build with a team of AI agents."
                ariaLabel="Open the Multi-Agent Builder"
            />
             <AppButton
                onClick={() => onNavigate('agentHub')}
                icon={<StoreIcon className="w-12 h-12 md:w-14 md:h-14 text-accent" />}
                title="Agent Hub"
                description="Discover new community agents."
                ariaLabel="Open the Agent Hub marketplace"
            />
        </div>
      </div>
    </main>
  );
};

export default HomePage;