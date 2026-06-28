import { authClient } from '@/lib/api/auth-client';
import {
  authCookieOptions,
  extractRefreshTokenFromSetCookie,
} from '@/lib/auth/cookies';
import { AUTH_COOKIES, AUTH_TTL } from '@/lib/auth/auth-constants';

export type RefreshedSession = {
  accessToken: string;
  refreshToken: string;
  role: string;
};

export async function refreshSessionOnServer(
  refreshToken: string,
): Promise<RefreshedSession | null> {
  try {
    const res = await authClient.post<{
      accessToken: string;
      refreshToken?: string;
      role: string;
    }>(
      '/auth/refresh',
      { refreshToken },
      {
        headers: { Cookie: `${AUTH_COOKIES.REFRESH}=${refreshToken}` },
        withCredentials: true,
      },
    );

    const data = res.data;
    const setCookies = res.headers['set-cookie'] ?? [];
    const refreshFromCookie = extractRefreshTokenFromSetCookie(setCookies);
    const nextRefresh = data.refreshToken ?? refreshFromCookie;
    if (!nextRefresh) return null;

    return {
      accessToken: data.accessToken,
      refreshToken: nextRefresh,
      role: data.role,
    };
  } catch {
    return null;
  }
}

export function applyRefreshedSessionCookies(
  res: { cookies: { set: (name: string, value: string, options: object) => void } },
  session: RefreshedSession,
) {
  res.cookies.set(
    AUTH_COOKIES.ACCESS,
    session.accessToken,
    authCookieOptions(AUTH_TTL.ACCESS_SECONDS),
  );
  res.cookies.set(
    AUTH_COOKIES.REFRESH,
    session.refreshToken,
    authCookieOptions(AUTH_TTL.REFRESH_SECONDS),
  );
}
