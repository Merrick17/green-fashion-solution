import { createUIMessageStreamResponse } from 'ai';
import { runProposalAgent } from '@/lib/ai/agents/proposal-agent';
import {
  createNestClient,
  fetchAgentContext,
  type AiProposalRequestBody,
} from '@/lib/ai';
import { guardAiRoute } from '@/lib/ai/server/route-guard';
import { formatAiStreamError } from '@/lib/ai/server/stream-error';
import { safeBuildRagContext } from '@/lib/ai/rag/rag-toggle';
import type { AgentContext } from '@repo/types';
import { type UIMessage } from 'ai';
import { getMessageText } from '@/lib/ai/chat-ui';
import {
  aiProposalBodySchema,
  validateBody,
  GuardrailError,
} from '@/lib/ai/orchestration';

export const maxDuration = 120;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function extractLastUserQuery(messages: unknown[]): string {
  const list = messages as UIMessage[];
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const msg = list[i];
    if (msg?.role === 'user') {
      const text = getMessageText(msg);
      if (text.trim()) return text.trim();
    }
  }
  return 'Generate a luxury fashion sourcing proposal from project moodboards and designer assets.';
}

export async function POST(req: Request) {
  try {
    const guard = await guardAiRoute(req, { roles: ['ADMIN'] });
    if (!guard.ok) return guard.response;

    const parsed = validateBody(aiProposalBodySchema, await req.json());
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    const { messages, projectId, modelId, revisionMode, enableRag, proposalId } =
      parsed.data satisfies AiProposalRequestBody;

    const client = createNestClient(guard.token);
    const agentContext = (await fetchAgentContext(
      client,
      projectId,
      revisionMode,
    )) as AgentContext;

    const query = extractLastUserQuery(messages);
    const ragContext = await safeBuildRagContext(
      client,
      projectId,
      agentContext,
      query,
      enableRag,
    );

    const result = await runProposalAgent({
      messages,
      modelId,
      accessToken: guard.token,
      projectId,
      proposalId,
      agentContext,
      revisionMode,
      ragContext,
      abortSignal: req.signal,
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
