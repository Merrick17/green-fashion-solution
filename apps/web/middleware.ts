import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { UserRole } from "@repo/types";
import {
  applyRefreshedSessionCookies,
  refreshSessionOnServer,
} from "@/lib/auth/server-refresh";
import { AUTH_COOKIES } from "@/lib/auth/auth-constants";
import { dashboardPathForRole, roleRoutePrefix } from "@/lib/auth/portal-routes";

const authEntryPaths = ["/login", "/register"];

async function verifyAccessToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    return payload;
  } catch {
    return null;
  }
}

async function resolveSession(req: NextRequest) {
  const accessToken = req.cookies.get(AUTH_COOKIES.ACCESS)?.value;
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) return { payload, refreshed: null };
  }

  const refreshToken = req.cookies.get(AUTH_COOKIES.REFRESH)?.value;
  if (!refreshToken) return null;

  const session = await refreshSessionOnServer(refreshToken);
  if (!session) return null;

  const payload = await verifyAccessToken(session.accessToken);
  if (!payload) return null;

  return { payload, refreshed: session };
}

function portalResponse(
  req: NextRequest,
  payload: { sub?: unknown; role?: unknown; email?: unknown },
  refreshed: Awaited<ReturnType<typeof refreshSessionOnServer>>,
) {
  const role = payload.role as UserRole;
  const allowedPrefix = roleRoutePrefix[role];

  if (allowedPrefix && !req.nextUrl.pathname.startsWith(allowedPrefix)) {
    const res = NextResponse.redirect(
      new URL(dashboardPathForRole(role), req.url),
    );
    if (refreshed) applyRefreshedSessionCookies(res, refreshed);
    return res;
  }

  const res = NextResponse.next();
  if (refreshed) applyRefreshedSessionCookies(res, refreshed);
  res.headers.set("x-user-id", String(payload.sub));
  res.headers.set("x-user-role", role);
  res.headers.set("x-user-email", String(payload.email ?? ""));
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (authEntryPaths.includes(pathname)) {
    const session = await resolveSession(req);
    if (session?.payload?.role) {
      const res = NextResponse.redirect(
        new URL(dashboardPathForRole(String(session.payload.role)), req.url),
      );
      if (session.refreshed) applyRefreshedSessionCookies(res, session.refreshed);
      return res;
    }
    return NextResponse.next();
  }

  const session = await resolveSession(req);
  if (session) {
    return portalResponse(req, session.payload, session.refreshed);
  }

  const loginUrl = new URL("/login", req.url);
  const res = NextResponse.redirect(loginUrl);
  const expired = { path: "/", maxAge: 0 };
  res.cookies.set(AUTH_COOKIES.ACCESS, "", expired);
  res.cookies.set(AUTH_COOKIES.REFRESH, "", expired);
  return res;
}

export const config = {
  matcher: [
    "/customer/:path*",
    "/admin/:path*",
    "/designer/:path*",
    "/login",
    "/register",
  ],
};
