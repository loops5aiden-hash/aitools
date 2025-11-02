import React from 'react';
import type { CurrentScreen } from '../App';
import type { User } from '../types';
import UserAvatar from './UserAvatar';
import {
    HomeIcon, MessageSquareIcon, FolderIcon, TerminalIcon, LayoutTemplateIcon, 
    SparklesIcon, StoreIcon, UsersIcon, MoreHorizontalIcon, SettingsIcon, ZapIcon, BotIcon
} from './icons';

interface SidebarProps {
  currentScreen: CurrentScreen;
  onNavigate: (screen: CurrentScreen) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  user: User | null;
  credits: number;
}

const NavItem: React.FC<{
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            isActive 
                ? 'bg-accent/10 text-accent' 
                : 'text-secondary hover:bg-surface hover:text-primary'
        }`}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, onOpenProfile, onOpenSettings, user, credits }) => {
    
    const NAV_ITEMS = [
        { screen: 'home', icon: HomeIcon, label: 'Home' },
        { screen: 'chat', icon: MessageSquareIcon, label: 'Gemini Agent' },
        { screen: 'projects', icon: FolderIcon, label: 'Projects' },
        { screen: 'terminal', icon: TerminalIcon, label: 'Terminal' },
        { screen: 'builder', icon: LayoutTemplateIcon, label: 'Builder' },
        { screen: 'makerStudio', icon: SparklesIcon, label: 'Maker Studio' },
        { screen: 'agentHub', icon: StoreIcon, label: 'Agent Hub' },
        { screen: 'connect', icon: UsersIcon, label: 'Connect' },
        { screen: 'extras', icon: MoreHorizontalIcon, label: 'Extras' },
    ];
    
  return (
    <aside className="w-64 bg-background border-r border-surface flex flex-col p-4 flex-shrink-0">
      <div className="flex items-center gap-2 mb-8">
        <BotIcon className="w-8 h-8 text-accent"/>
        <h1 className="text-xl font-bold text-primary">Gemini Agents</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map(item => (
            <NavItem 
                key={item.screen}
                icon={item.icon}
                label={item.label}
                isActive={currentScreen === item.screen}
                onClick={() => onNavigate(item.screen as CurrentScreen)}
            />
        ))}
      </nav>

      <div className="mt-auto">
        <button 
            onClick={onOpenProfile}
            className="flex items-center w-full gap-3 p-3 rounded-lg hover:bg-surface"
        >
            <UserAvatar user={user} />
            <div className="text-left">
                <p className="font-semibold text-primary">{user?.name}</p>
                <div className="flex items-center gap-1 text-xs text-accent font-bold">
                   <ZapIcon className="w-3 h-3"/>
                   <span>{credits} Credits</span>
                </div>
            </div>
        </button>
         <button 
            onClick={onOpenSettings}
            className="flex items-center w-full gap-3 p-3 rounded-lg text-secondary hover:bg-surface hover:text-primary text-sm font-semibold"
        >
            <SettingsIcon className="w-5 h-5"/>
            <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
