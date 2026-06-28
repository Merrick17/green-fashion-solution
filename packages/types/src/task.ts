import type { PaginationParams } from './pagination';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum BriefType {
  FABRIC_SOURCING = 'FABRIC_SOURCING',
  PRODUCT_REFERENCE = 'PRODUCT_REFERENCE',
  STYLE_DIRECTION = 'STYLE_DIRECTION',
  TECHNICAL_REVIEW = 'TECHNICAL_REVIEW',
  SAMPLE_PREP = 'SAMPLE_PREP',
}

export enum BriefPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Task {
  id: string;
  projectId: string;
  designerId: string;
  title: string;
  description?: string;
  briefType: BriefType;
  priority: BriefPriority;
  deliverables?: string;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  /** Anonymized project reference — no customer data exposed to designers */
  projectRef?: string;
}

export interface CreateTaskDto {
  projectId: string;
  designerId: string;
  title: string;
  description?: string;
  briefType?: BriefType;
  priority?: BriefPriority;
  deliverables?: string;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  briefType?: BriefType;
  priority?: BriefPriority;
  deliverables?: string;
  status?: TaskStatus;
  dueDate?: string;
}

export interface TaskListParams extends PaginationParams {
  status?: TaskStatus;
  briefType?: BriefType;
  priority?: BriefPriority;
}
