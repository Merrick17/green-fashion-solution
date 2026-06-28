import { parseKeywordsInput } from '@repo/utils';
import type { AssetSourcingFormValues } from './asset-metadata-form';
import type { UploadJob } from './asset-upload-queue';

/** Parses a numeric form field to a non-negative int, or undefined when empty. */
export function parseNum(v: string): number | undefined {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Local id for upload jobs (no crypto dependency). */
export function newJobId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Builds the create-asset payload shared by fabric and product uploads.
 * Numeric/optional fields collapse to undefined when blank so the backend
 * stores null. `imageUrl` is the storage key returned by the upload step.
 */
export function buildAssetPayload(
  job: UploadJob,
  meta: AssetSourcingFormValues,
  imageUrl: string,
  briefId?: string,
) {
  return {
    name: job.name,
    description: meta.description || undefined,
    imageUrl,
    keywords: parseKeywordsInput(meta.keywords),
    composition: meta.composition || undefined,
    color: meta.color || undefined,
    supplier: meta.supplier || undefined,
    moq: parseNum(meta.moq),
    leadTimeDays: parseNum(meta.leadTimeDays),
    pricePerUnitMillimes: parseNum(meta.pricePerUnitMillimes),
    seasons: meta.seasons,
    briefId,
  };
}
