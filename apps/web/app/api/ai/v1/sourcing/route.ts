import { createUIMessageStreamResponse } from 'ai';
import { runSourcingAgent } from '@/lib/ai/agents/sourcing-agent';
import { guardAiRoute } from '@/lib/ai/server/route-guard';
import { formatAiStreamError } from '@/lib/ai/server/stream-error';
import { aiSourcingBodySchema, validateBody, GuardrailError } from '@/lib/ai/orchestration';
import { createNestClient, listTasks } from '@/lib/ai/server/nest-client';

export const maxDuration = 120;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const guard = await guardAiRoute(req, { roles: ['DESIGNER'] });
    if (!guard.ok) return guard.response;

    const parsed = validateBody(aiSourcingBodySchema, await req.json());
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const { messages, modelId } = parsed.data;

    // Pre-load open tasks so the agent doesn't start blind
    const contextMessages: Array<{ role: 'system'; content: string }> = [];
    try {
      const client = createNestClient(guard.token);
      const taskResult = await listTasks(client, { limit: 20 });
      const open = taskResult.data.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
      if (open.length > 0) {
        const summary = open
          .slice(0, 10)
          .map((t) => `- [${t.id}] ${t.title} (${t.status}, ${t.briefType ?? 'GENERAL'})${t.dueDate ? `, due ${t.dueDate}` : ''}`)
          .join('\n');
        contextMessages.push({
          role: 'system',
          content: `Your open tasks (${open.length} total):\n${summary}\nCall getTaskDetail for full deliverables before starting work.`,
        });
      } else {
        contextMessages.push({ role: 'system', content: 'You have no open tasks assigned right now.' });
      }
    } catch {
      // Non-fatal — agent can still call listMyTasks manually
    }

    const result = await runSourcingAgent({
      messages,
      modelId,
      accessToken: guard.token,
      contextMessages,
      abortSignal: req.signal,
    });

    const stream = result.toUIMessageStream({ onError: formatAiStreamError });
    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    if (error instanceof GuardrailError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
