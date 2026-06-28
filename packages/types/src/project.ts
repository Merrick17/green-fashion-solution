export enum ProjectStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  SOURCING = 'SOURCING',
  PROPOSAL_READY = 'PROPOSAL_READY',
  SAMPLING = 'SAMPLING',
  PRODUCTION = 'PRODUCTION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  season: string | null;
  category: string | null;
  budgetBand: string | null;
  targetDelivery: string | null;
  moq: number | null;
  garmentCategories: string[];
  targetPricePointMillimes: number | null;
  sustainabilityRequirements: string | null;
  briefSubmittedAt: string | null;
  coverImageUrl: string | null;
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  title: string;
  description: string;
  season?: string;
  category?: string;
  budgetBand?: string;
  targetDelivery?: string;
  moq?: number;
  garmentCategories?: string[];
  targetPricePointMillimes?: number;
  sustainabilityRequirements?: string;
  coverImageUrl?: string;
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  season?: string;
  category?: string;
  budgetBand?: string;
  targetDelivery?: string;
  moq?: number;
  garmentCategories?: string[];
  targetPricePointMillimes?: number;
  sustainabilityRequirements?: string;
  coverImageUrl?: string;
}
