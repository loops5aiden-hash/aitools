import React from 'react';
import Sidebar from './Sidebar';
import type { CurrentScreen } from '../App';
import type { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: CurrentScreen;
  onNavigate: (screen: CurrentScreen) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  credits: number;
  user: User | null;
}

const Layout: React.FC<LayoutProps> = ({ children, currentScreen, onNavigate, onOpenProfile, onOpenSettings, credits, user }) => {
  return (
    <div className="flex h-screen w-full bg-background text-primary font-sans">
      <Sidebar 
        currentScreen={currentScreen}
        onNavigate={onNavigate}
        onOpenProfile={onOpenProfile}
        onOpenSettings={onOpenSettings}
        user={user}
        credits={credits}
      />
      <main className="flex-1 overflow-y-auto bg-surface/50">
        {children}
      </main>
    </div>
  );
};

export default Layout;
