/**
 * Sourcing metadata shared by fabric and product assets. All fields optional so
 * existing rows keep working. Monetary values are millimes (integers, never floats).
 */
export type AssetAvailabilityStatus =
  | 'AVAILABLE'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'DISCONTINUED';

export interface AssetSourcingFields {
  composition?: string;
  color?: string;
  supplier?: string;
  moq?: number;
  leadTimeDays?: number;
  pricePerUnitMillimes?: number;
  briefId?: string;
  seasons?: string[];
  availabilityStatus?: AssetAvailabilityStatus;
}

export interface FabricAsset extends AssetSourcingFields {
  id: string;
  designerId: string;
  name: string;
  description?: string;
  imageUrl: string;
  keywords: string[];
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAsset extends AssetSourcingFields {
  id: string;
  designerId: string;
  name: string;
  description?: string;
  imageUrl: string;
  keywords: string[];
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFabricAssetDto extends AssetSourcingFields {
  name: string;
  description?: string;
  imageUrl: string;
  keywords?: string[];
  metadata?: Record<string, unknown> | null;
}

export interface CreateProductAssetDto extends AssetSourcingFields {
  name: string;
  description?: string;
  imageUrl: string;
  keywords?: string[];
  metadata?: Record<string, unknown> | null;
}