import { getAccessTokenFromRequest, verifyAccessToken } from '@/lib/ai';

export const maxDuration = 30;
export const runtime = 'nodejs';

/** Deprecated — custom model deploy is not supported with Fireworks AI. */
export async function POST(req: Request) {
  try {
    const token = getAccessTokenFromRequest(req);
    if (!token) return new Response('Unauthorized', { status: 401 });

    const payload = await verifyAccessToken(token);
    if (payload.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    return new Response(
      JSON.stringify({
        error: 'Custom model deploy is not available. Use FIREWORKS_MODEL_* env vars instead.',
      }),
      { status: 501, headers: { 'content-type': 'application/json' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Model create failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
