/**
 * Auth cookie names and TTLs for the web app.
 *
 * These mirror values the API sets/rotates; the two apps agree on them by
 * convention. Auth-flow logic stays here in the web app (not in `packages/`,
 * per the CLAUDE.md rule that `packages/` holds only types + pure utilities).
 */

export const AUTH_COOKIES = {
  /** Access-token cookie name (read by Next.js middleware). */
  ACCESS: "accessToken",
  /** Refresh-token cookie name (HttpOnly, rotated by the API). */
  REFRESH: "refreshToken",
} as const;

export const AUTH_TTL = {
  /** Access-token cookie max-age, in seconds (15 minutes). */
  ACCESS_SECONDS: 15 * 60,
  /** Refresh-token cookie max-age, in seconds (7 days). */
  REFRESH_SECONDS: 7 * 24 * 60 * 60,
} as const;