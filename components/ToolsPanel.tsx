
import React from 'react';
import type { Tool } from '../types';
import { TOOLS } from '../config/agentsAndTools';

interface ToolsPanelProps {
  tools: Tool[];
  onSelectTool: (tool: Tool) => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ tools, onSelectTool }) => {
  return (
    <div className="absolute bottom-full left-0 w-full mb-3 animate-fade-in">
        <div className="bg-surface/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 max-h-80 overflow-y-auto scrollbar-thin">
            <h3 className="text-sm font-semibold text-secondary mb-3 px-2">AVAILABLE TOOLS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => onSelectTool(tool)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200 text-left"
                    >
                        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-background/50 border border-white/10">
                            <tool.icon className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <p className="font-semibold text-primary">{tool.name}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ToolsPanel;
