import {
  convertToModelMessages,
  streamText,
  isStepCount,
  type ToolSet,
  type UIMessage,
} from "ai";
import { resolveAiProvider } from "./providers/provider.service";
import type { AiModelPurpose } from "./providers/provider.types";
import {
  resolveOrchestration,
  runOrchestrated,
  type OrchestrationOverrides,
} from "./orchestration";

export interface RunAgentOptions {
  system: string;
  contextMessages?: Array<{ role: "system"; content: string }>;
  messages: unknown[];
  tools: ToolSet;
  modelId?: string;
  maxSteps?: number;
  purpose?: AiModelPurpose;
  /** Phase 1 (additive): caller abort signal, propagated to the provider stream. */
  abortSignal?: AbortSignal;
  /** Phase 1 (additive): orchestration overrides (timeout/retry/fallback/guardrails/instrumentation). Absence preserves prior behaviour. */
  orchestration?: OrchestrationOverrides;
}

export type StreamTextReturn = Awaited<ReturnType<typeof streamText>>;

export async function runAgent(options: RunAgentOptions): Promise<StreamTextReturn> {
  const state = resolveOrchestration(options.orchestration);
  const hasAbort = !!options.abortSignal;

  // Default path: no orchestration and no caller abort -> byte-for-byte original behaviour.
  if (!state.active && !hasAbort) {
    const { getModelHandle, providerModelId } = await resolveAiProvider(
      options.modelId,
      options.purpose ?? "chat",
    );
    const contextMessages = options.contextMessages ?? [];
    const uiMessages = Array.isArray(options.messages)
      ? (options.messages as UIMessage[])
      : [];
    const modelMessages = await convertToModelMessages(uiMessages);

    return streamText({
      model: getModelHandle(providerModelId),
      system: options.system,
      messages: [...contextMessages, ...modelMessages],
      tools: options.tools,
      stopWhen: isStepCount(options.maxSteps ?? 20),
      allowSystemInMessages: true,
    });
  }

  return runOrchestrated(
    {
      system: options.system,
      contextMessages: options.contextMessages,
      messages: options.messages,
      tools: options.tools,
      modelId: options.modelId,
      maxSteps: options.maxSteps,
      purpose: options.purpose,
      abortSignal: options.abortSignal,
    },
    state,
  );
}