import { UserRole } from './user';

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: UserRole;
  body: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  customerId: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  customer?: { id: string; name: string; email: string };
}

export interface CreateMessageThreadDto {
  projectId?: string;
  body: string;
}

export interface SendMessageDto {
  body: string;
}
