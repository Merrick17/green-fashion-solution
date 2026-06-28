import type { NextResponse } from "next/server";
import { AUTH_COOKIES, AUTH_TTL } from "@/lib/auth/auth-constants";

export function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string,
) {
  res.cookies.set(
    AUTH_COOKIES.ACCESS,
    accessToken,
    authCookieOptions(AUTH_TTL.ACCESS_SECONDS),
  );
  res.cookies.set(
    AUTH_COOKIES.REFRESH,
    refreshToken,
    authCookieOptions(AUTH_TTL.REFRESH_SECONDS),
  );
}

export function clearAuthCookies(res: NextResponse) {
  const expired = { ...authCookieOptions(0), maxAge: 0 };
  res.cookies.set(AUTH_COOKIES.ACCESS, "", expired);
  res.cookies.set(AUTH_COOKIES.REFRESH, "", expired);
}

export function extractRefreshTokenFromSetCookie(
  setCookies: string[],
): string | undefined {
  for (const raw of setCookies) {
    const match = raw.match(new RegExp(`^${AUTH_COOKIES.REFRESH}=([^;]+)`));
    if (match?.[1]) return decodeURIComponent(match[1]);
  }
  return undefined;
}