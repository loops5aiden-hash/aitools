import React from 'react';
import type { User } from '../types';

interface UserAvatarProps {
  user: User | null;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, className }) => {
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const color = user?.color || '#D4AF37'; 

  return (
    <div
      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-white border border-white/20 shadow-sm ${className}`}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;