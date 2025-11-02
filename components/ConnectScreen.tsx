
import React from 'react';
import type { PublicUser } from '../types';
import UserAvatar from './UserAvatar';

interface ConnectScreenProps {
  users: PublicUser[];
  onViewProfile: (user: PublicUser) => void;
}

const ConnectScreen: React.FC<ConnectScreenProps> = ({ users, onViewProfile }) => {
  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl font-bold text-primary">Connect</h1>
        <p className="text-secondary">Discover other creators on the platform.</p>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onViewProfile(user)}
            className="w-full flex items-center gap-4 p-4 rounded-lg text-left transition-colors duration-200 bg-surface/75 hover:bg-white/10"
          >
            <UserAvatar user={user} className="w-12 h-12 text-xl" />
            <div>
              <h3 className="font-semibold text-primary">{user.name}</h3>
              <p className="text-sm text-secondary">{user.followers} Followers</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConnectScreen;
