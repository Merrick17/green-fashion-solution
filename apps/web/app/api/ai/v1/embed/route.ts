import { getAccessTokenFromRequest, verifyAccessToken } from '@/lib/ai';
import { embedTexts } from '@/lib/ai/fireworks/embeddings';

export const maxDuration = 30;
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const token = getAccessTokenFromRequest(req);
    if (!token) return new Response('Unauthorized', { status: 401 });

    const payload = await verifyAccessToken(token);
    if (payload.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    const { input, model } = (await req.json()) as {
      input: string | string[];
      model?: string;
    };
    if (!input) return new Response('input required', { status: 400 });

    const result = await embedTexts(input, model);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Embed failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
