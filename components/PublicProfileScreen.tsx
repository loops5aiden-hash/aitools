
import React, { useState, useEffect } from 'react';
import type { PublicUser, Agent, Tool } from '../types';
import UserAvatar from './UserAvatar';
import { ICON_MAP } from './icons';

interface PublicProfileScreenProps {
  user: PublicUser;
  onClose: () => void;
}

const PublicProfileScreen: React.FC<PublicProfileScreenProps> = ({ user, onClose }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(user.followers);
    
    // Simulate loading followed state
    useEffect(() => {
        const followedUsers = JSON.parse(localStorage.getItem('followed_users') || '{}');
        setIsFollowing(!!followedUsers[user.id]);
    }, [user.id]);
    
    const handleFollow = () => {
        const newFollowingState = !isFollowing;
        setIsFollowing(newFollowingState);
        setFollowerCount(prev => newFollowingState ? prev + 1 : prev - 1);
        
        const followedUsers = JSON.parse(localStorage.getItem('followed_users') || '{}');
        if (newFollowingState) {
            followedUsers[user.id] = true;
        } else {
            delete followedUsers[user.id];
        }
        localStorage.setItem('followed_users', JSON.stringify(followedUsers));
    };


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface/75 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8 w-full max-w-md" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin">
            <div className="flex flex-col items-center gap-4 border-b border-surface pb-6 mb-6">
                <UserAvatar user={user} className="w-24 h-24 text-4xl" />
                <h1 className="text-3xl font-bold text-primary">{user.name}</h1>
                <p className="text-secondary">{followerCount.toLocaleString()} Followers</p>
                <button
                    onClick={handleFollow}
                    className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                        isFollowing ? 'bg-white/10 text-primary hover:bg-white/20' : 'bg-accent text-background hover:opacity-90'
                    }`}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-primary mb-3">Published Agents</h2>
                    {user.publishedAgents.length > 0 ? (
                        <ul className="space-y-2">
                        {user.publishedAgents.map(agent => {
                            const Icon = typeof agent.icon === 'string' ? ICON_MAP[agent.icon] : agent.icon;
                            return (
                                <li key={agent.id} className="flex items-center gap-3 bg-black/20 p-3 rounded-lg">
                                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-surface rounded-md"><Icon className="w-5 h-5 text-accent" /></div>
                                    <div>
                                      <p className="font-medium text-primary">{agent.name}</p>
                                      <p className="text-xs text-secondary">{agent.description}</p>
                                    </div>
                                </li>
                            )
                        })}
                        </ul>
                    ) : <p className="text-secondary text-sm text-center py-2">This user hasn't published any agents yet.</p>}
                </div>
                 <div>
                    <h2 className="text-lg font-semibold text-primary mb-3">Published Tools</h2>
                    {user.publishedTools.length > 0 ? (
                        <ul className="space-y-2">
                        {user.publishedTools.map(tool => {
                            const Icon = typeof tool.icon === 'string' ? ICON_MAP[tool.icon] : tool.icon;
                            return (
                                <li key={tool.id} className="flex items-center gap-3 bg-black/20 p-3 rounded-lg">
                                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-surface rounded-md"><Icon className="w-5 h-5 text-accent" /></div>
                                    <div>
                                      <p className="font-medium text-primary">{tool.name}</p>
                                      <p className="text-xs text-secondary">{tool.command}</p>
                                    </div>
                                </li>
                            )
                        })}
                        </ul>
                    ) : <p className="text-secondary text-sm text-center py-2">This user hasn't published any tools yet.</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileScreen;
