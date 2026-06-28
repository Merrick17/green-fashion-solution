/**
 * Default API origin for the web app.
 *
 * Centralized so the axios clients (`apiClient`, `authClient`, the AI nest
 * client) and the auth origin resolver agree on one fallback value.
 */
export const DEFAULT_API_BASE_URL = "http://localhost:3000/api";

/** Resolved API base URL — `NEXT_PUBLIC_API_URL` or the local default. */
export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
}