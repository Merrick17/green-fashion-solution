export enum MeetingStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface Meeting {
  id: string;
  projectId: string;
  customerId: string;
  status: MeetingStatus;
  requestedAt: string;
  scheduledAt?: string;
  teamsLink?: string;
  agenda?: string;
  durationMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingDto {
  projectId: string;
  requestedAt: string;
  agenda?: string;
  durationMinutes?: number;
}

export interface UpdateMeetingDto {
  status?: MeetingStatus;
  scheduledAt?: string;
}