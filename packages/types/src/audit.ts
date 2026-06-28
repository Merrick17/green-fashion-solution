export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}
