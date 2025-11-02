
import React, { useState, useRef } from 'react';
import type { Message, User, Agent, Tool, CreditState } from '../types';
import ChatHeader from './ChatHeader';
import ChatWindow from './ChatWindow';
import InputBar from './InputBar';
import ToolsPanel from './ToolsPanel';
import { TOOLS } from '../config/agentsAndTools';

interface ChatScreenProps {
    messages: Message[];
    isLoading: boolean;
    user: User | null;
    error: string | null;
    handleSendMessage: (text: string) => void;
    handleNewChat: () => void;
    activeAgent: Agent;
    onOpenAgentSwitcher: () => void;
    theme: 'light' | 'dark';
    customTools: Tool[];
    creditState: CreditState;
    setError: (error: string | null) => void;
}

const ChatScreen: React.FC<ChatScreenProps> = (props) => {
    const { 
        messages, isLoading, user, error, handleSendMessage, handleNewChat, 
        activeAgent, onOpenAgentSwitcher, theme, customTools, creditState, setError
    } = props;
    
    const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const allTools = [...TOOLS, ...customTools];

    const handleSelectTool = (tool: Tool) => {
        const commandBase = tool.command.split(' ')[0];
        setInputValue(prev => `${commandBase} `.trimStart());
        setIsToolsPanelOpen(false);
        textareaRef.current?.focus();
    };
    
    const onSendMessage = (text: string) => {
        handleSendMessage(text);
        setInputValue('');
    }

    return (
        <div className="flex flex-col h-full relative max-w-4xl mx-auto">
            <ChatHeader 
              agent={activeAgent} 
              onOpenAgentSwitcher={onOpenAgentSwitcher} 
              onNewChat={handleNewChat}
              theme={theme}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <ChatWindow messages={messages} isLoading={isLoading} user={user} />
            </main>
            <div className="relative border-t border-surface px-4 py-4 md:px-6 bg-background/50 backdrop-blur-xl">
              {isToolsPanelOpen && <ToolsPanel tools={allTools} onSelectTool={handleSelectTool} />}
              {error && <p className="text-red-500 text-center text-sm mb-2" onClick={() => setError(null)}>{error}</p>}
              <InputBar 
                value={inputValue}
                onChange={setInputValue}
                onSendMessage={onSendMessage} 
                isLoading={isLoading} 
                isToolsPanelOpen={isToolsPanelOpen} 
                onToggleToolsPanel={() => setIsToolsPanelOpen(p => !p)}
                textareaRef={textareaRef}
                credits={creditState.daily}
                tools={allTools}
              />
            </div>
        </div>
    );
};

export default ChatScreen;
