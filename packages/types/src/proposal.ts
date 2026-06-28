export enum ProposalStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
}

export interface ProposalItem {
  id: string;
  sectionId: string;
  fabricAssetId?: string | null;
  productAssetId?: string | null;
  notes?: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  fabricAsset?: {
    id: string;
    name: string;
    description?: string;
    imageUrl: string;
    keywords?: string[];
  };
  productAsset?: {
    id: string;
    name: string;
    description?: string;
    imageUrl: string;
    keywords?: string[];
  };
}

export interface ProposalBudgetSection {
  sectionId: string;
  title: string;
  totalMillimes: number;
}

export interface ProposalBudgetSummary {
  totalMillimes: number;
  itemCount: number;
  perSection: ProposalBudgetSection[];
}

export interface ProposalSection {
  id: string;
  proposalId: string;
  title: string;
  description?: string | null;
  adminNotes?: string | null;
  position: number;
  items: ProposalItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProposalChangeRequest {
  id: string;
  proposalId: string;
  customerId: string;
  message: string;
  sectionId?: string | null;
  createdAt: string;
}

export interface Proposal {
  id: string;
  projectId: string;
  version: number;
  status: ProposalStatus;
  title?: string | null;
  season?: string | null;
  styleSummary?: string | null;
  sections: ProposalSection[];
  changeRequests?: ProposalChangeRequest[];
  budgetSummary?: ProposalBudgetSummary;
  /** Admin only */
  lastViewedAt?: string | Date | null;
  /** Admin only */
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    title: string;
    description: string;
    customerId?: string;
    customer?: { name: string; email: string };
  };
}

export interface CreateProposalDto {
  projectId: string;
  status?: ProposalStatus;
  title?: string;
  season?: string;
  styleSummary?: string;
  sections: {
    title: string;
    description?: string;
    adminNotes?: string;
    position?: number;
    items: Omit<ProposalItem, 'id' | 'sectionId' | 'fabricAsset' | 'productAsset' | 'createdAt' | 'updatedAt'>[];
  }[];
}

export interface UpdateProposalDto {
  status?: ProposalStatus;
  title?: string;
  season?: string;
  styleSummary?: string;
  changeRequestMessage?: string;
  sectionId?: string;
  sections?: {
    id?: string;
    title: string;
    description?: string;
    adminNotes?: string;
    position?: number;
    items: Omit<ProposalItem, 'id' | 'sectionId' | 'fabricAsset' | 'productAsset' | 'createdAt' | 'updatedAt'>[];
  }[];
}

export interface CreateChangeRequestDto {
  message: string;
  sectionId?: string;
}