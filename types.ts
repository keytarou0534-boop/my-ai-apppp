
export type Role = 'ADMIN' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  role: Role;
  invitationCode?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text?: string;
  imageUrl?: string;
  timestamp: number;
}

export interface ChatSession {
  customerId: string;
  customerName: string;
  messages: Message[];
  lastUpdated: number;
}

export interface Invitation {
  code: string;
  createdAt: number;
  isUsed: boolean;
  assignedTo?: string;
}
