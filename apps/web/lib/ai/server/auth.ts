import { jwtVerify } from "jose";
import { AUTH_COOKIES } from "@/lib/auth/auth-constants";

export function getAccessTokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;
  const match = cookie.match(
    new RegExp(`(?:^|;\\s*)${AUTH_COOKIES.ACCESS}=([^;]+)`),
  );
  return match?.[1] ?? null;
}

export async function verifyAccessToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  return payload as { sub?: string; role?: string };
}
