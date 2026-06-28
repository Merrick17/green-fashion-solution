export enum InspirationAction {
  LIKED = 'LIKED',
  SAVED = 'SAVED',
  SELECTED = 'SELECTED',
}

export interface InspirationSelection {
  id: string;
  projectId: string;
  customerId: string;
  fabricAssetId?: string | null;
  productAssetId?: string | null;
  action: InspirationAction;
  createdAt: string;
  updatedAt: string;
  /** Populated by admin inspiration list include; absent on the customer route. */
  fabricAsset?: { id: string; name: string; imageUrl: string } | null;
  productAsset?: { id: string; name: string; imageUrl: string } | null;
}

export interface CreateInspirationSelectionDto {
  projectId: string;
  fabricAssetId?: string;
  productAssetId?: string;
  action: InspirationAction;
}

export interface CuratedAsset {
  id: string;
  type: 'fabric' | 'product';
  name: string;
  description?: string | null;
  imageUrl: string;
  selections: InspirationSelection[];
}
