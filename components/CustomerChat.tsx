
import React from 'react';
import { User, ChatSession } from '../types';
import ChatWindow from './ChatWindow';

interface CustomerChatProps {
  customerUser: User;
  session?: ChatSession;
  onUpdateSession: (session: ChatSession) => void;
}

const CustomerChat: React.FC<CustomerChatProps> = ({ customerUser, session, onUpdateSession }) => {
  // If no session exists yet, create an empty one
  const currentSession: ChatSession = session || {
    customerId: customerUser.id,
    customerName: customerUser.name,
    messages: [],
    lastUpdated: Date.now()
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChatWindow 
        user={customerUser} 
        session={currentSession} 
        onUpdateSession={onUpdateSession}
      />
    </div>
  );
};

export default CustomerChat;
