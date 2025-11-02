import React from 'react';
import { UsersIcon, PlusSquareIcon } from './icons';
import type { Agent } from '../types';

interface ChatHeaderProps {
  agent: Agent;
  onOpenAgentSwitcher: () => void;
  onNewChat: () => void;
  theme: 'light' | 'dark';
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ agent, onOpenAgentSwitcher, onNewChat, theme }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-surface bg-background/50 backdrop-blur-xl sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-surface border border-white/10 dark:border-black/10 flex items-center justify-center">
            <agent.icon className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-lg font-semibold text-primary">{agent.name}</h2>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          className="p-2 rounded-full text-secondary hover:bg-surface hover:text-primary transition-colors duration-200"
          aria-label="Start new chat"
        >
          <PlusSquareIcon className="w-6 h-6" />
        </button>
        <button
          onClick={onOpenAgentSwitcher}
          className="flex items-center gap-2 p-2 rounded-full text-secondary hover:bg-surface hover:text-primary transition-colors duration-200"
          aria-label="Switch agent"
        >
          <UsersIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;