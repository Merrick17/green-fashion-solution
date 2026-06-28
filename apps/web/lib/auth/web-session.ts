import { AUTH_COOKIES, AUTH_TTL } from "@/lib/auth/auth-constants";

function setClientCookie(name: string, value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
}

/** Mirror tokens on the web origin so Next.js middleware can gate portal routes. */
export function persistWebSession(accessToken: string, refreshToken: string) {
  if (typeof document === "undefined") return;
  setClientCookie(AUTH_COOKIES.ACCESS, accessToken, AUTH_TTL.ACCESS_SECONDS);
  setClientCookie(AUTH_COOKIES.REFRESH, refreshToken, AUTH_TTL.REFRESH_SECONDS);
}

export function persistAccessTokenCookie(accessToken: string) {
  if (typeof document === "undefined") return;
  setClientCookie(AUTH_COOKIES.ACCESS, accessToken, AUTH_TTL.ACCESS_SECONDS);
}

export function clearWebSessionCookies() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIES.ACCESS}=; path=/; max-age=0`;
  document.cookie = `${AUTH_COOKIES.REFRESH}=; path=/; max-age=0`;
}

export function getWebSessionRefreshToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${AUTH_COOKIES.REFRESH}=([^;]*)`),
  );
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}