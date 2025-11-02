import React, { useState, useEffect } from 'react';
import type { CommunityAgent } from '../types';
import { DownloadIcon, CheckCircle2Icon } from './icons';

interface AgentDetailViewProps {
  agent: CommunityAgent;
  onClose: () => void;
  onInstall: (agent: CommunityAgent) => void;
  isInstalled: boolean;
}

const AgentDetailView: React.FC<AgentDetailViewProps> = ({ agent, onClose, onInstall, isInstalled: initialIsInstalled }) => {
    const [isInstalled, setIsInstalled] = useState(initialIsInstalled);

    useEffect(() => {
        setIsInstalled(initialIsInstalled);
    }, [initialIsInstalled, agent.id]);

    const handleInstall = () => {
        if (!isInstalled) {
            onInstall(agent);
            setIsInstalled(true);
        }
    };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface/75 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8 w-full max-w-lg flex flex-col h-[80vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-6 pb-6 border-b border-surface">
            <div className="w-20 h-20 rounded-xl bg-background/50 border border-white/10 flex items-center justify-center flex-shrink-0">
                <agent.icon className="w-10 h-10 text-accent" />
            </div>
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-primary">{agent.name}</h2>
                <p className="text-secondary">by {agent.author}</p>
                <button
                    onClick={handleInstall}
                    disabled={isInstalled}
                    className="w-full mt-3 py-2 rounded-lg bg-accent text-background font-semibold text-sm hover:opacity-90 transition-all disabled:bg-surface disabled:text-secondary disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isInstalled ? <CheckCircle2Icon className="w-5 h-5"/> : <DownloadIcon className="w-5 h-5" />}
                    {isInstalled ? 'Installed' : 'Install Agent'}
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 pr-2 scrollbar-thin space-y-6">
            <div>
                 <p className="text-primary">{agent.longDescription}</p>
            </div>

             <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-secondary">Installs</p>
                    <p className="text-lg font-semibold text-primary">{agent.installs.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-secondary">Version</p>
                    <p className="text-lg font-semibold text-primary">{agent.version}</p>
                </div>
                 <div>
                    <p className="text-sm text-secondary">Category</p>
                    <p className="text-lg font-semibold text-primary">{agent.category}</p>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-primary mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {agent.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full border border-accent/20">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailView;
