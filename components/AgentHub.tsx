import React, { useState, useMemo } from 'react';
import type { CommunityAgent } from '../types';
import { SearchIcon, StoreIcon } from './icons';
import ScreenHeader from './ScreenHeader';

interface AgentHubProps {
  agents: CommunityAgent[];
  onBack: () => void;
  onViewAgent: (agent: CommunityAgent) => void;
}

const CATEGORIES = ['All', 'Productivity', 'Creative', 'Developer', 'Fun'];

const AgentHub: React.FC<AgentHubProps> = ({ agents, onBack, onViewAgent }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredAgents = useMemo(() => {
        return agents.filter(agent => {
            const matchesCategory = activeCategory === 'All' || agent.category === activeCategory;
            const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  agent.author.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [agents, searchQuery, activeCategory]);

    return (
        <div className="h-full flex flex-col p-6">
            <ScreenHeader title="Agent Hub" icon={StoreIcon} onBack={onBack} />
            
            <div className="mb-4 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input 
                    type="text"
                    placeholder="Search agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg pl-10 pr-4 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
            </div>

            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${
                            activeCategory === category 
                            ? 'bg-accent text-background' 
                            : 'bg-surface text-secondary hover:bg-white/20 hover:text-primary'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                {filteredAgents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAgents.map((agent) => (
                            <button
                                key={agent.id}
                                onClick={() => onViewAgent(agent)}
                                className="w-full flex items-start gap-4 p-4 rounded-lg bg-surface text-left hover:bg-white/10 border border-white/10 hover:border-accent/50 transition-all"
                            >
                                <div className="w-12 h-12 rounded-lg bg-background/50 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                                    <agent.icon className="w-7 h-7 text-accent" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-primary">{agent.name}</h3>
                                    <p className="text-xs text-secondary mb-1">by {agent.author} • {agent.installs.toLocaleString()} installs</p>
                                    <p className="text-sm text-primary/80">{agent.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-lg font-semibold text-primary">No Agents Found</p>
                        <p className="text-secondary">Try adjusting your search or filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentHub;
