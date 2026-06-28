import { useAuthStore } from "@/lib/auth-store";
import { authClient } from "@/lib/api/auth-client";
import {
  getWebSessionRefreshToken,
  persistAccessTokenCookie,
  persistWebSession,
} from "@/lib/auth/web-session";

let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresh the access token directly against the NestJS API.
 * Serialized so concurrent 401s share one refresh call.
 */
export async function refreshSession(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const storedRefreshToken = getWebSessionRefreshToken();
      const res = await authClient.post<{
        accessToken: string;
        refreshToken?: string;
      }>("/auth/refresh", storedRefreshToken ? { refreshToken: storedRefreshToken } : {});
      const { accessToken, refreshToken } = res.data;
      useAuthStore.getState().setAccessToken(accessToken);
      if (refreshToken) {
        persistWebSession(accessToken, refreshToken);
      } else {
        persistAccessTokenCookie(accessToken);
      }
      return accessToken;
    } catch {
      useAuthStore.getState().clearAuth();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function isAuthRequestUrl(url?: string): boolean {
  if (!url) return false;
  return /\/auth\/(login|register|refresh|logout)/.test(url);
}
