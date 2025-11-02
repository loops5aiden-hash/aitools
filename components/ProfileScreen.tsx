
import React, { useState, useEffect } from 'react';
import type { User, Agent, Tool, CreditState, UserStats } from '../types';
import UserAvatar from './UserAvatar';
import { ICON_MAP, BarChartIcon, ClockIcon, ZapIcon, LayoutTemplateIcon } from './icons';

interface ProfileScreenProps {
  user: User;
  onSave: (user: User) => void;
  onClose: () => void;
  customAgents: Agent[];
  customTools: Tool[];
  onDelete: (id: string, type: 'agent' | 'tool') => void;
  creditState: CreditState;
  userStats: UserStats;
}

const AVATAR_COLORS = [
  '#D4AF37', '#2563eb', '#db2777', '#16a34a', '#7c3aed',
];

const CountdownTimer: React.FC<{ nextReset: number }> = ({ nextReset }) => {
    const calculateTimeLeft = () => {
        const difference = nextReset - Date.now();
        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
        if(isNaN(value as number)) return null;
        return (
            <span key={interval} className="font-mono">{String(value).padStart(2, '0')}{interval.charAt(0)}</span>
        );
    }).filter(Boolean);

    return timerComponents.length ? <div className="flex gap-1.5">{timerComponents}</div> : <span>Ready!</span>;
};


const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onSave, onClose, customAgents, customTools, onDelete, creditState, userStats }) => {
  const [name, setName] = useState(user.name);
  const [color, setColor] = useState(user.color);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSave({ name: name.trim(), color });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface/75 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8 w-full max-w-md" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin">
            <h1 className="text-2xl font-bold text-primary mb-3 text-center">Your Profile</h1>
            <form onSubmit={handleSave} className="flex flex-col items-center gap-6 border-b border-surface pb-8 mb-6">
            <UserAvatar user={{ name, color }} className="w-20 h-20 text-3xl mb-2" />
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-background/50 border border-surface rounded-lg px-4 py-3 text-primary text-center focus:outline-none focus:ring-2 focus:ring-accent/70"
                required
                aria-label="Your Name"
            />
            <div className="flex justify-center gap-3">
                {AVATAR_COLORS.map((c) => (
                <button
                    type="button" key={c} onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform duration-200 ${color === c ? 'ring-2 ring-offset-2 ring-offset-surface ring-accent scale-110' : 'ring-1 ring-surface'}`}
                    style={{ backgroundColor: c }} aria-label={`Select color ${c}`}
                />
                ))}
            </div>
            <div className="flex gap-4 w-full mt-4">
                <button
                type="button" onClick={onClose}
                className="w-full py-3 bg-white/10 text-primary rounded-lg font-semibold hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-surface"
                >
                Cancel
                </button>
                <button
                type="submit" disabled={!name.trim()}
                className="w-full py-3 bg-accent text-background rounded-lg font-semibold hover:opacity-90 transition-opacity duration-200 disabled:bg-surface disabled:text-secondary disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent/70 focus:ring-offset-2 focus:ring-offset-surface"
                >
                Save Changes
                </button>
            </div>
            </form>

            <div className="space-y-6">
                <div className="border-b border-surface pb-6">
                    <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2"><ZapIcon className="w-5 h-5 text-accent" /> Credit Status</h2>
                    <div className="bg-black/20 p-4 rounded-lg space-y-3">
                         <div className="text-center bg-accent/10 border border-accent/20 text-accent text-sm font-semibold py-2 px-3 rounded-lg mb-4">
                            ✨ 25% off all credit costs during Beta! ✨
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-secondary">Daily Credits</span>
                            <span className="font-bold text-primary">{creditState.daily} / 100</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-secondary">Monthly Credits</span>
                            <span className="font-bold text-primary">{creditState.monthly} / 600</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-2 border-t border-surface">
                            <span className="text-secondary flex items-center gap-1"><ClockIcon className="w-3 h-3"/> Daily Reset In</span>
                            <span className="font-semibold text-accent"><CountdownTimer nextReset={creditState.nextReset} /></span>
                        </div>
                    </div>
                </div>

                 <div className="border-b border-surface pb-6">
                    <h2 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2"><BarChartIcon className="w-5 h-5 text-accent" /> Your Statistics</h2>
                     <div className="bg-black/20 p-4 rounded-lg grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-primary">{userStats.messagesSent}</p>
                            <p className="text-xs text-secondary">Messages</p>
                        </div>
                        <div>
                             <p className="text-2xl font-bold text-primary">{userStats.imagesGenerated}</p>
                            <p className="text-xs text-secondary">Images</p>
                        </div>
                         <div>
                             <p className="text-2xl font-bold text-primary">{userStats.creations}</p>
                            <p className="text-xs text-secondary">Creations</p>
                        </div>
                        <div>
                             <p className="text-2xl font-bold text-primary">{userStats.buildsCompleted || 0}</p>
                            <p className="text-xs text-secondary">Builds</p>
                        </div>
                    </div>
                </div>
            
                <div>
                    <h2 className="text-lg font-semibold text-primary mb-3">My Custom Agents</h2>
                    {customAgents.length > 0 ? (
                        <ul className="space-y-2">
                        {customAgents.map(agent => {
                            const Icon = typeof agent.icon === 'string' ? ICON_MAP[agent.icon] : agent.icon;
                            return (
                                <li key={agent.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-surface rounded-md"><Icon className="w-5 h-5 text-accent" /></div>
                                        <span className="font-medium text-primary">{agent.name}</span>
                                    </div>
                                    <button onClick={() => onDelete(agent.id, 'agent')} className="text-secondary hover:text-red-500 text-xs font-semibold">DELETE</button>
                                </li>
                            )
                        })}
                        </ul>
                    ) : <p className="text-secondary text-sm text-center py-2">You haven't created any agents yet.</p>}
                </div>
                 <div>
                    <h2 className="text-lg font-semibold text-primary mb-3">My Custom Tools</h2>
                    {customTools.length > 0 ? (
                        <ul className="space-y-2">
                        {customTools.map(tool => {
                            const Icon = typeof tool.icon === 'string' ? ICON_MAP[tool.icon] : tool.icon;
                            return (
                                <li key={tool.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-surface rounded-md"><Icon className="w-5 h-5 text-accent" /></div>
                                        <span className="font-medium text-primary">{tool.name}</span>
                                    </div>
                                    <button onClick={() => onDelete(tool.id, 'tool')} className="text-secondary hover:text-red-500 text-xs font-semibold">DELETE</button>
                                </li>
                            )
                        })}
                        </ul>
                    ) : <p className="text-secondary text-sm text-center py-2">You haven't created any tools yet.</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
