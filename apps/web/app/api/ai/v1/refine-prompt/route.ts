import { generateText } from 'ai';
import { guardAiRoute } from '@/lib/ai/server/route-guard';
import { resolveAiProvider } from '@/lib/ai/providers/provider.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM: Record<string, string> = {
  moodboard:
    'You are a fashion creative director writing AI prompts. Expand the user brief into a moodboard-agent instruction that triggers: generateMoodboardConcept → setMoodboardMetadata → generateTldrawMoodboard. Mention season, silhouette, hex palette, fabric textures, and layout (editorial-grid or collage). Output ONLY the refined prompt — no preamble, no quotes.',
  proposal:
    'You are a luxury fashion sourcing specialist writing AI instructions. Expand the brief into a detailed proposal-agent prompt covering project context, fabric category, style keywords, and required sections. Output ONLY the refined prompt.',
  sourcing:
    'You are a sourcing manager giving precise instructions to a design assistant. Expand the brief into a clear, actionable sourcing-agent prompt with task context and specific material or reference requirements. Output ONLY the refined prompt.',
};

export async function POST(req: Request) {
  const guard = await guardAiRoute(req, { roles: ['CUSTOMER', 'ADMIN', 'DESIGNER'] });
  if (!guard.ok) return guard.response;

  let body: { prompt?: string; context?: string };
  try {
    body = (await req.json()) as { prompt?: string; context?: string };
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const raw = (body.prompt ?? '').trim();
  if (!raw) return new Response(JSON.stringify({ error: 'prompt is required' }), { status: 400 });

  const context = (body.context ?? 'moodboard') as keyof typeof SYSTEM;
  const system = SYSTEM[context] ?? SYSTEM.moodboard;

  try {
    const { getModelHandle, providerModelId } = await resolveAiProvider(null, 'chat');
    const { text } = await generateText({
      model: getModelHandle(providerModelId),
      instructions: system,
      prompt: raw,
      maxOutputTokens: 200,
      temperature: 0.7,
    });
    return Response.json({ refined: text.trim() });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'AI error' }),
      { status: 502 },
    );
  }
}
