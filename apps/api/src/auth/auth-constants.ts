/**
 * Auth configuration constants for the API.
 *
 * Token lifetimes, the dev-only JWT secret fallback, and the refresh-token
 * Redis key scheme live here so the auth service, JWT module/strategy, and the
 * Redis refresh-token store agree on one source of truth. Auth-flow logic
 * stays in the API (not in `packages/`, per the CLAUDE.md rule).
 */

export const AUTH_TTL = {
  /** Access-token cookie/redis TTL, in seconds (15 minutes). */
  ACCESS_SECONDS: 15 * 60,
  /** Refresh-token redis TTL, in seconds (7 days). */
  REFRESH_SECONDS: 7 * 24 * 60 * 60,
  /** jwt-sign expiresIn string for access tokens. */
  ACCESS_JWT: '15m',
  /** jwt-sign expiresIn string for refresh tokens. */
  REFRESH_JWT: '7d',
} as const;

/**
 * Fallback JWT secret used only when JWT_SECRET is unset. Never rely on this
 * in production — env validation requires a 32+ char secret.
 */
export const DEV_JWT_SECRET_FALLBACK = 'change-me-in-production';

/** Redis key prefix for stored refresh tokens. */
export const REFRESH_TOKEN_KEY_PREFIX = 'refresh';

/** Build the Redis key for a single refresh token (per user + token hash). */
export function refreshTokenKey(userId: string, tokenHash: string): string {
  return `${REFRESH_TOKEN_KEY_PREFIX}:${userId}:${tokenHash}`;
}

/** Redis key glob matching every refresh token for a user. */
export function refreshTokenKeysPattern(userId: string): string {
  return `${REFRESH_TOKEN_KEY_PREFIX}:${userId}:*`;
}