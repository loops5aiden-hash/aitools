import React, { useRef, useEffect } from 'react';
import type { Message, User } from '../types';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  user: User | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, user }) => {
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="space-y-8">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} user={user} />
      ))}
      {isLoading && <LoadingIndicator />}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatWindow;
