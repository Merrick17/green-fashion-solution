import { createUIMessageStreamResponse } from 'ai';
import { runMoodboardAgent } from '@/lib/ai/agents/moodboard-agent';
import { guardAiRoute } from '@/lib/ai/server/route-guard';
import { formatAiStreamError } from '@/lib/ai/server/stream-error';
import {
  messagesContainImages,
  resolveMoodboardAgentMode,
} from '@/lib/ai/message-media';
import {
  aiChatBodySchema,
  validateBody,
  GuardrailError,
} from '@/lib/ai/orchestration';
import type { CanvasContextPayload } from '@/lib/ai/types';

export const maxDuration = 120;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const guard = await guardAiRoute(req, { roles: ['CUSTOMER', 'ADMIN'] });
    if (!guard.ok) return guard.response;

    const parsed = validateBody(aiChatBodySchema, await req.json());
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    const {
      messages,
      moodboardId,
      canvasContext,
      modelId,
      enableImage,
      projectId,
      mode,
    } = parsed.data;

    const resolvedMode = resolveMoodboardAgentMode(messages, mode);
    const ctx = (canvasContext ?? undefined) as
      | CanvasContextPayload
      | undefined;

    const result = await runMoodboardAgent({
      messages,
      mode: resolvedMode,
      hasImages: messagesContainImages(messages),
      modelId,
      enableImage: enableImage ?? process.env.AI_ENABLE_IMAGE_GEN !== 'false',
      accessToken: guard.token,
      moodboardId,
      projectId,
      abortSignal: req.signal,
      context: ctx
        ? {
            items: ctx.items as any,
            viewport: ctx.viewport,
            moodboard: {
              styleDirection: ctx.styleDirection ?? '',
              colorPalette: ctx.colorPalette ?? [],
              fabricSuggestions: ctx.fabricSuggestions ?? [],
              mood: ctx.mood ?? '',
            },
            selectedItemIds: ctx.selectedItemIds,
            projectId: ctx.projectId ?? projectId,
          }
        : undefined,
    });

    const stream = result.toUIMessageStream({ onError: formatAiStreamError });
    const streamResp = createUIMessageStreamResponse({ stream });
    const headers = new Headers(streamResp.headers);
    headers.set('X-AI-Model-Used', process.env.FIREWORKS_MODEL_CHAT ?? 'accounts/fireworks/models/kimi-k2p6');
    headers.set('Access-Control-Expose-Headers', 'X-AI-Model-Used');
    return new Response(streamResp.body, { status: streamResp.status, headers });
  } catch (error) {
    if (error instanceof GuardrailError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    const status =
      message.includes('FIREWORKS_API_KEY') ||
      message.includes('API_KEY')
        ? 503
        : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }
}
