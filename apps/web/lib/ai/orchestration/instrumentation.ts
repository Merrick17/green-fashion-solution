import { aiLog } from "./ai-logger";
import { recordAiCall, recordAiError, recordToolCall } from "./ai-metrics";

/**
 * Produces onError/onFinish hooks for Vercel AI SDK `streamText`.
 *
 * When `enabled` is false but a `clearTimeout` is provided, the hooks still
 * fire solely to release a pending timeout timer (so a successful/failed stream
 * never leaves a dangling timer). When neither is needed, returns `{}` so
 * `streamText` is called with no hooks at all (byte-for-byte with pre-Phase-1).
 */
export interface InstrumentationHooks {
  onError?: (event: { error: unknown }) => void;
  onEnd?: (event: unknown) => void;
}

export interface InstrumentationOptions {
  enabled: boolean;
  label?: string;
  clearTimeout?: () => void;
  extra?: Record<string, unknown>;
}

function errorToString(error: unknown): string {
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function createInstrumentation(opts: InstrumentationOptions): InstrumentationHooks {
  if (!opts.enabled) {
    if (!opts.clearTimeout) return {};
    return {
      onError: () => opts.clearTimeout?.(),
      onEnd: () => opts.clearTimeout?.(),
    };
  }

  const label = opts.label ?? "ai-run";
  const startedAt = Date.now();
  recordAiCall(label);

  return {
    onError: ({ error }: { error: unknown }) => {
      recordAiError(label);
      aiLog("error", "ai_run_error", {
        label,
        error: errorToString(error),
        ...(opts.extra ?? {}),
      });
      opts.clearTimeout?.();
    },
    onEnd: () => {
      const durationMs = Date.now() - startedAt;
      aiLog("debug", "ai_run_finish", {
        label,
        durationMs,
        ...(opts.extra ?? {}),
      });
      recordToolCall(label, "finish");
      opts.clearTimeout?.();
    },
  };
}