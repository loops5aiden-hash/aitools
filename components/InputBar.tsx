
import React, { useEffect, useMemo } from 'react';
import { SendIcon, GridIcon } from './icons';
import type { Tool } from '../types';

interface InputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isToolsPanelOpen: boolean;
  onToggleToolsPanel: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  credits: number;
  tools: Tool[];
}

const InputBar: React.FC<InputBarProps> = ({ value, onChange, onSendMessage, isLoading, isToolsPanelOpen, onToggleToolsPanel, textareaRef, credits, tools }) => {
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [value, textareaRef]);

  const currentCost = useMemo(() => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 0;
    
    const commandMatch = trimmedValue.match(/^\/(\w+)/);
    if (commandMatch) {
      const tool = tools.find(t => t.command.startsWith(`/${commandMatch[1]}`));
      return tool?.cost || 0;
    }
    return 0; // Messages are free
  }, [value, tools]);

  const hasEnoughCredits = credits >= currentCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading && hasEnoughCredits) {
      onSendMessage(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1 relative flex items-center bg-surface/75 backdrop-blur-xl border border-white/10 rounded-xl">
        <button
          type="button"
          onClick={onToggleToolsPanel}
          className={`p-3 rounded-full text-secondary hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/70 focus:ring-offset-2 focus:ring-offset-background ${isToolsPanelOpen ? 'text-accent' : ''}`}
          aria-label="Toggle tools panel"
        >
          <GridIcon className="w-5 h-5" />
        </button>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? '...' : 'Message Gemini...'}
          className="w-full bg-transparent p-3 text-primary resize-none focus:outline-none max-h-48 scrollbar-thin pr-20"
          rows={1}
          disabled={isLoading}
        />
        {currentCost > 0 && (
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-1 rounded-full ${hasEnoughCredits ? 'text-accent bg-accent/10' : 'text-red-400 bg-red-500/10'}`}>
            {currentCost} {currentCost > 1 ? 'credits' : 'credit'}
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading || !value.trim() || !hasEnoughCredits}
        className="p-3 bg-accent rounded-full text-background disabled:bg-surface disabled:cursor-not-allowed hover:opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/70 focus:ring-offset-2 focus:ring-offset-background self-end"
        aria-label="Send message"
      >
        <SendIcon className="w-5 h-5" />
      </button>
    </form>
  );
};

export default InputBar;
