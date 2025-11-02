import React from 'react';
import { UserIcon, SettingsIcon, MoreHorizontalIcon } from './icons';

interface ExtrasScreenProps {
    onOpenProfile: () => void;
    onOpenSettings: () => void;
}

const ExtrasScreen: React.FC<ExtrasScreenProps> = ({ onOpenProfile, onOpenSettings }) => {
  return (
    <div className="p-4 md:p-6 animate-fade-in flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface/75 flex items-center justify-center mb-4 mt-8">
            <MoreHorizontalIcon className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-primary">Extras & Options</h1>
        <p className="text-secondary mb-8">Manage your profile and app settings.</p>

        <div className="space-y-3 w-full max-w-sm">
            <button
                onClick={onOpenProfile}
                className="w-full flex items-center gap-4 p-4 rounded-lg text-left transition-colors duration-200 bg-surface/75 hover:bg-white/10"
            >
                <UserIcon className="w-6 h-6 text-accent" />
                <div>
                    <h3 className="font-semibold text-primary">Your Profile</h3>
                    <p className="text-sm text-secondary">Manage your name, creations & stats.</p>
                </div>
            </button>
             <button
                onClick={onOpenSettings}
                className="w-full flex items-center gap-4 p-4 rounded-lg text-left transition-colors duration-200 bg-surface/75 hover:bg-white/10"
            >
                <SettingsIcon className="w-6 h-6 text-accent" />
                <div>
                    <h3 className="font-semibold text-primary">Settings</h3>
                    <p className="text-sm text-secondary">Theme, data and app preferences.</p>
                </div>
            </button>
        </div>
    </div>
  );
};

export default ExtrasScreen;