export enum BriefOptionType {
  SEASON = 'SEASON',
  CATEGORY = 'CATEGORY',
}

export interface BriefOption {
  id: string;
  type: BriefOptionType;
  label: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBriefOptionDto {
  type: BriefOptionType;
  label: string;
  sortOrder?: number;
  active?: boolean;
}

export interface UpdateBriefOptionDto {
  label?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface ListBriefOptionsParams {
  type?: BriefOptionType;
  includeInactive?: boolean;
}
