export enum ProjectType {
  PRODUCT_DEVELOPMENT = 'PRODUCT_DEVELOPMENT',
  FABRIC_SOURCING = 'FABRIC_SOURCING',
  FACTORY_COORDINATION = 'FACTORY_COORDINATION',
  SAMPLING_PRODUCTION = 'SAMPLING_PRODUCTION',
}

export enum BudgetRange {
  UNDER_10K = 'UNDER_10K',
  RANGE_10K_25K = 'RANGE_10K_25K',
  RANGE_25K_50K = 'RANGE_25K_50K',
  RANGE_50K_100K = 'RANGE_50K_100K',
  OVER_100K = 'OVER_100K',
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  CONVERTED = 'CONVERTED',
}

export interface CreateLeadDto {
  name: string;
  brand: string;
  email: string;
  projectType: ProjectType;
  budgetRange: BudgetRange;
}

export interface UpdateLeadDto {
  status?: LeadStatus;
}

export interface Lead {
  id: string;
  name: string;
  brand: string;
  email: string;
  projectType: ProjectType;
  budgetRange: BudgetRange;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}