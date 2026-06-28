import { getAccessTokenFromRequest, verifyAccessToken } from '@/lib/ai';
import { isFireworksConfigured } from '@/lib/ai/fireworks/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = getAccessTokenFromRequest(req);
    if (!token) return new Response('Unauthorized', { status: 401 });
    await verifyAccessToken(token);

    const fireworks = isFireworksConfigured();
    const rag = process.env.AI_ENABLE_RAG !== 'false';
    const image = process.env.AI_ENABLE_IMAGE_GEN !== 'false';

    return Response.json({
      status: fireworks ? 'ok' : 'degraded',
      providers: {
        chat: 'fireworks',
        imageGen: 'fireworks',
        embeddings: 'fireworks',
        vision: 'fireworks',
      },
      fireworks,
      features: {
        chat: fireworks,
        rag: rag && fireworks,
        imageGen: image && fireworks,
        vision: fireworks,
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json({ status: 'error' }, { status: 500 });
  }
}
