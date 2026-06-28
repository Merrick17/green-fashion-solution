import type { Moodboard } from './moodboard';
import type { FileRecord } from './file';
import type { InspirationSelection } from './inspiration';
import type { Notification } from './notification';
import type { AuditLog } from './audit';

export interface AdminOverview {
  users: number;
  projects: number;
  proposals: number;
  tasks: number;
  meetings: number;
  leads: number;
  waitlist: number;
  moodboards: number;
  files: number;
  notifications: number;
  auditLogs: number;
  assets: number;
  designerApplications: number;
}

export interface AdminMoodboard extends Moodboard {
  project: { id: string; title: string; customerId: string };
}

export interface AdminFile extends FileRecord {
  project: { id: string; title: string };
}

export interface AdminInspiration extends InspirationSelection {
  project: { id: string; title: string };
  customer: { id: string; name: string; email: string };
}

export interface AdminNotification extends Notification {
  user: { id: string; name: string; email: string };
}

export interface AdminAuditLog extends AuditLog {
  user: { id: string; name: string; email: string };
}
