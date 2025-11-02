
import React from 'react';
import type { Agent } from '../types';

interface AgentSwitcherProps {
  agents: Agent[];
  activeAgentId: string;
  onSelectAgent: (agent: Agent) => void;
  onClose: () => void;
}

const AgentSwitcher: React.FC<AgentSwitcherProps> = ({ agents, activeAgentId, onSelectAgent, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface/75 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-md flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-primary mb-1">Switch Agent</h2>
        <p className="text-secondary mb-6">Choose a specialized assistant for your task.</p>
        <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg text-left transition-colors duration-200 ${
                activeAgentId === agent.id 
                  ? 'bg-accent/20 border border-accent/50' 
                  : 'hover:bg-white/10 border border-transparent'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-background/50 border border-white/10 flex items-center justify-center flex-shrink-0">
                <agent.icon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">{agent.name}</h3>
                <p className="text-sm text-secondary">{agent.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentSwitcher;
