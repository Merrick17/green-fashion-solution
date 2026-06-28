/**
 * Cross-cutting shared type unions that don't belong to a single domain model.
 */

/** Distinguishes a fabric asset from a product/garment reference. */
export type AssetKind = 'fabric' | 'product';

/** Asset tab filter — `all` plus each {@link AssetKind}. */
export type AssetTab = 'all' | AssetKind;

/** Log severity levels, shared by the API structured logger and the web AI logger. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Sort direction used by list queries and the web data-table. */
export type SortOrder = 'asc' | 'desc';