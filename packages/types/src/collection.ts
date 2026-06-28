export interface CollectionItem {
  id: string;
  collectionId: string;
  fabricAssetId?: string;
  productAssetId?: string;
  position: number;
  fabricAsset?: { id: string; name: string; imageUrl: string };
  productAsset?: { id: string; name: string; imageUrl: string };
}

export interface Collection {
  id: string;
  designerId: string;
  name: string;
  description?: string;
  coverItemId?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: CollectionItem[];
  _count?: { items: number };
}

export interface CreateCollectionDto {
  name: string;
  description?: string;
}

export interface UpdateCollectionDto {
  name?: string;
  description?: string;
  /** Id of a CollectionItem to use as the cover. Pass null to clear. */
  coverItemId?: string | null;
}

export interface AddCollectionItemDto {
  fabricAssetId?: string;
  productAssetId?: string;
  position?: number;
}

/** Ordered list of CollectionItem ids; positions are assigned 0..n-1. */
export interface ReorderCollectionItemsDto {
  itemIds: string[];
}