export enum DesignerApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface DesignerApplication {
  id: string;
  name: string;
  email: string;
  portfolioUrl?: string | null;
  experience?: string | null;
  message?: string | null;
  status: DesignerApplicationStatus;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDesignerApplicationDto {
  name: string;
  email: string;
  portfolioUrl?: string;
  experience?: string;
  message?: string;
}

export interface ApproveDesignerApplicationDto {
  password: string;
}
