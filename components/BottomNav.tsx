
import React from 'react';
import { HomeIcon, MessageSquareIcon, SparklesIcon, MoreHorizontalIcon, UsersIcon } from './icons';

type ActiveView = 'home' | 'chat' | 'connect' | 'extras';

interface BottomNavProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onOpenMakerStudio: () => void;
}

const NavButton: React.FC<{
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-accent' : 'text-secondary hover:text-primary'}`}
        aria-label={label}
    >
        <Icon className="w-6 h-6" />
        <span className="text-xs font-medium">{label}</span>
    </button>
);


const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate, onOpenMakerStudio }) => {
  return (
    <nav className="grid grid-cols-5 items-center border-t border-surface bg-background/50 backdrop-blur-xl sticky bottom-0 z-20">
      <NavButton
        icon={HomeIcon}
        label="Home"
        isActive={activeView === 'home'}
        onClick={() => onNavigate('home')}
      />
      <NavButton
        icon={MessageSquareIcon}
        label="Chat"
        isActive={activeView === 'chat'}
        onClick={() => onNavigate('chat')}
      />
       <div className="flex justify-center">
        <button
            onClick={onOpenMakerStudio}
            className="relative flex items-center justify-center w-14 h-14 -translate-y-4 bg-accent text-background rounded-full shadow-lg shadow-accent/30 hover:opacity-90 transition-opacity"
            aria-label="Create new agent or tool"
        >
            <SparklesIcon className="w-7 h-7" />
        </button>
       </div>
      <NavButton
        icon={UsersIcon}
        label="Connect"
        isActive={activeView === 'connect'}
        onClick={() => onNavigate('connect')}
      />
      <NavButton
        icon={MoreHorizontalIcon}
        label="Extras"
        isActive={activeView === 'extras'}
        onClick={() => onNavigate('extras')}
      />
    </nav>
  );
};

export default BottomNav;
