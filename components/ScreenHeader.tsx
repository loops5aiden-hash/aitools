import React from 'react';
import { ArrowLeftIcon } from './icons';

interface ScreenHeaderProps {
    title: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    onBack: () => void;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, icon: Icon, onBack }) => {
    return (
        <header className="flex items-center gap-4 mb-6 flex-shrink-0">
            <button
                onClick={onBack}
                className="p-2 text-secondary hover:text-primary rounded-full bg-surface/50 hover:bg-surface transition-colors"
                aria-label="Go back"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                    <Icon className="w-6 h-6 text-accent" />
                </div>
                <h1 className="text-2xl font-bold text-primary">{title}</h1>
            </div>
        </header>
    );
};

export default ScreenHeader;
