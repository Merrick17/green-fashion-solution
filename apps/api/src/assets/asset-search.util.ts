import type { Prisma } from '@prisma/client';

export function normalizeAssetKeywords(keywords?: string[]): string[] {
  if (!keywords?.length) return [];
  return [...new Set(keywords.map((k) => k.trim().toLowerCase()).filter(Boolean))];
}

export function buildAssetSearchWhere<T extends Prisma.FabricAssetWhereInput | Prisma.ProductAssetWhereInput>(
  base: T,
  search?: string,
): T {
  const q = search?.trim();
  if (!q) return base;

  const terms = q
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    ...base,
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      ...(terms.length ? [{ keywords: { hasSome: terms } }] : []),
    ],
  } as T;
}

export type AssetRow = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string;
  keywords: string[];
  designerId: string;
  metadata: unknown;
};

export function mapAssetRow(asset: AssetRow) {
  return {
    id: asset.id,
    name: asset.name,
    description: asset.description,
    imageUrl: asset.imageUrl,
    keywords: asset.keywords ?? [],
    designerId: asset.designerId,
    metadata: asset.metadata,
  };
}
