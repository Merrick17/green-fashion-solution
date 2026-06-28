import { getAccessTokenFromRequest, verifyAccessToken } from "./auth";

export type AiRouteGuardResult =
  | { ok: true; token: string; userId: string; role?: string }
  | { ok: false; response: Response };

export async function guardAiRoute(
  req: Request,
  options?: { roles?: string[] },
): Promise<AiRouteGuardResult> {
  const token = getAccessTokenFromRequest(req);
  if (!token) {
    return { ok: false, response: new Response("Unauthorized", { status: 401 }) };
  }

  let payload: { sub?: string; role?: string };
  try {
    payload = await verifyAccessToken(token);
  } catch {
    return { ok: false, response: new Response("Unauthorized", { status: 401 }) };
  }

  if (options?.roles?.length && payload.role && !options.roles.includes(payload.role)) {
    return { ok: false, response: new Response("Forbidden", { status: 403 }) };
  }

  if (process.env.AI_ENABLE_IMAGE_GEN === "false" && req.url.includes("/images")) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "AI image generation disabled" }), {
        status: 503,
        headers: { "content-type": "application/json" },
      }),
    };
  }

  return { ok: true, token, userId: payload.sub ?? "anonymous", role: payload.role };
}
