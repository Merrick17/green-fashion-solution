export enum NotificationType {
  PROPOSAL_READY = 'PROPOSAL_READY',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  MEETING_REQUESTED = 'MEETING_REQUESTED',
  MEETING_APPROVED = 'MEETING_APPROVED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}