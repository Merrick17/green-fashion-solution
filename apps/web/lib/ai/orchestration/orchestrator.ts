import {
  convertToModelMessages,
  streamText,
  isStepCount,
  type ToolSet,
  type UIMessage,
} from "ai";
type StreamTextReturn = Awaited<ReturnType<typeof streamText>>;
import { resolveAiProvider } from "../providers/provider.service";
import type { AiModelPurpose } from "../providers/provider.types";
import { composeAbortSignal } from "./timeout";
import { withRetry } from "./retry";
import { resolveModelWithFallback } from "./fallback";
import { runInputGuardrails, GuardrailError } from "./guardrails";
import { createInstrumentation } from "./instrumentation";
import { aiLog } from "./ai-logger";

/** Per-run orchestration overrides. All optional; absence preserves prior behaviour. */
export interface OrchestrationOverrides {
  /** Abort the run after N ms (also composes with any caller abortSignal). */
  timeoutMs?: number;
  /** Retry attempts for the setup phase (provider resolution + message conversion). */
  retries?: number;
  /** Model ids to try if the primary model resolution fails. */
  fallbackModels?: string[];
  /** Emit structured logs + metrics for this run. */
  instrumentation?: boolean;
  /** Input guardrails: false | "advisory" (log+proceed) | "block" (throw). */
  guardrails?: false | "advisory" | "block";
  /** Wrap tools with call instrumentation. */
  toolRouter?: boolean;
  /** Label used in logs/metrics. */
  label?: string;
}

export interface OrchestrationState {
  active: boolean;
  timeoutMs: number;
  retries: number;
  fallbackModels: string[];
  instrumentation: boolean;
  guardrails: false | "advisory" | "block";
  toolRouter: boolean;
  label: string;
}

function parseCsv(env?: string): string[] {
  return (env ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeGuardrail(value: OrchestrationOverrides["guardrails"]): OrchestrationState["guardrails"] {
  if (value === "advisory" || value === "block") return value;
  return false;
}

/** Merge caller overrides with env defaults. No overrides + no env -> inactive. */
export function resolveOrchestration(
  overrides: OrchestrationOverrides = {},
): OrchestrationState {
  const timeoutMs =
    overrides.timeoutMs ?? (Number(process.env.AI_REQUEST_TIMEOUT_MS) || 0);
  const retries = overrides.retries ?? Number(process.env.AI_RETRY_ATTEMPTS ?? 0);
  const fallbackModels =
    overrides.fallbackModels ?? parseCsv(process.env.AI_MODEL_FALLBACKS);
  const instrumentation =
    overrides.instrumentation ?? process.env.AI_INSTRUMENTATION === "true";
  const envGuardrails: "advisory" | "block" | false =
    process.env.AI_GUARDRAILS === "true"
      ? "block"
      : ((process.env.AI_GUARDRAILS_MODE as "advisory" | "block" | undefined) ?? false);
  const guardrails = normalizeGuardrail(overrides.guardrails ?? envGuardrails);
  const toolRouter = overrides.toolRouter ?? process.env.AI_TOOL_ROUTER === "true";
  const label = overrides.label ?? "ai-run";

  const active = !!(
    timeoutMs ||
    retries ||
    fallbackModels.length ||
    instrumentation ||
    guardrails ||
    toolRouter
  );

  return {
    active,
    timeoutMs,
    retries,
    fallbackModels,
    instrumentation,
    guardrails,
    toolRouter,
    label,
  };
}

export interface OrchestratedRunInput {
  system: string;
  contextMessages?: Array<{ role: "system"; content: string }>;
  messages: unknown[];
  tools: ToolSet;
  modelId?: string;
  maxSteps?: number;
  purpose?: AiModelPurpose;
  abortSignal?: AbortSignal;
}

/**
 * Runs an AI generation with the orchestration layer applied. Only invoked when
 * orchestration is active OR a caller abortSignal is present; otherwise
 * `runAgent` takes the byte-for-byte original path.
 */
export async function runOrchestrated(
  input: OrchestratedRunInput,
  state: OrchestrationState,
): Promise<StreamTextReturn> {
  if (state.guardrails) {
    const result = runInputGuardrails({
      system: input.system,
      messages: input.messages,
    });
    if (!result.ok) {
      aiLog("warn", "guardrail_violation", {
        label: state.label,
        reason: result.reason,
        mode: state.guardrails,
      });
      if (state.guardrails === "block") {
        throw new GuardrailError(result.reason ?? "Guardrail violation");
      }
    }
  }

  const { getModelHandle, providerModelId } = await resolveModelWithFallback(
    input.modelId,
    input.purpose ?? "chat",
    state.fallbackModels,
    state.retries,
  );

  const contextMessages = input.contextMessages ?? [];
  const uiMessages = Array.isArray(input.messages)
    ? (input.messages as UIMessage[])
    : [];
  const modelMessages = await withRetry(
    () => convertToModelMessages(uiMessages),
    { retries: state.retries },
  );

  const { signal, clear } = composeAbortSignal(input.abortSignal, state.timeoutMs);
  const hooks = createInstrumentation({
    enabled: state.instrumentation,
    label: state.label,
    clearTimeout: state.timeoutMs ? clear : undefined,
  });

  return streamText({
    model: getModelHandle(providerModelId),
    system: input.system,
    messages: [...contextMessages, ...modelMessages],
    tools: input.tools,
    stopWhen: isStepCount(input.maxSteps ?? 20),
    allowSystemInMessages: true,
    ...(signal ? { abortSignal: signal } : {}),
    ...(hooks.onError ? { onError: hooks.onError } : {}),
    ...(hooks.onEnd ? { onEnd: hooks.onEnd } : {}),
  }) as StreamTextReturn;
}

// Re-export so callers can use a single entry point if desired.
export { resolveAiProvider };