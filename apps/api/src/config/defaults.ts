/**
 * Default base URLs used as fallbacks when the corresponding env vars are unset.
 *
 * Centralized so `main.ts`, the events service, the WS gateway, storage, and
 * the PDF service agree on the same dev defaults.
 */
export const DEFAULTS = {
  /** API origin (no trailing slash). */
  API_BASE_URL: 'http://localhost:3000',
  /** Web app origin (no trailing slash). */
  WEB_BASE_URL: 'http://localhost:3001',
  /** API path prefix mounted under the API origin. */
  API_PREFIX: '/api',
} as const;

export const DEFAULT_API_BASE_URL = DEFAULTS.API_BASE_URL;
export const DEFAULT_WEB_URL = DEFAULTS.WEB_BASE_URL;