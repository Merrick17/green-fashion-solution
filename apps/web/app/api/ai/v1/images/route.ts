import { guardAiRoute } from '@/lib/ai/server/route-guard';
import { generateFashionImage } from '@/lib/ai/server/image-gen';
import { createNestClient } from '@/lib/ai/server/nest-client';

export const maxDuration = 120;
export const runtime = 'nodejs';

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ??
  'http://localhost:3000';

export async function GET(req: Request) {
  try {
    const guard = await guardAiRoute(req);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(req.url);
    const prompt = searchParams.get('prompt');
    const moodboardId = searchParams.get('moodboardId') ?? undefined;

    if (!prompt) {
      return new Response('prompt required', { status: 400 });
    }
    if (!moodboardId) {
      return new Response('moodboardId required', { status: 400 });
    }

    const client = createNestClient(guard.token);
    const imageRef = await generateFashionImage(prompt, {
      client,
      moodboardId,
    });

    if (imageRef.startsWith('http://') || imageRef.startsWith('https://')) {
      return Response.redirect(imageRef);
    }

    const { data } = await client.get<{ url: string }>('/files/resolve', {
      params: { key: imageRef },
    });
    const target = data.url.startsWith('http')
      ? data.url
      : `${API_ORIGIN}${data.url}`;
    return Response.redirect(target);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Image generation failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
