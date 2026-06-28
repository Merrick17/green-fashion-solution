import { resolveAiProvider } from "../providers/provider.service";
import type { AiModelPurpose, ProviderResolutionResult } from "../providers/provider.types";
import { withRetry } from "./retry";

/**
 * Resolve an AI provider, trying fallback model ids only if the primary
 * resolution throws. With an empty fallback list and `retries: 0` this is
 * behaviourally identical to calling `resolveAiProvider` directly.
 *
 * NOTE: fallback applies to provider RESOLUTION only. Retrying an
 * already-started stream with a different model would be unsafe and is
 * intentionally not attempted here.
 */
export async function resolveModelWithFallback(
  modelId: string | undefined,
  purpose: AiModelPurpose,
  fallbackModels: string[] = [],
  retries = 0,
): Promise<ProviderResolutionResult> {
  const candidates = [modelId, ...fallbackModels].filter(
    (m): m is string => !!m && !!m.trim(),
  );

  if (!candidates.length) {
    // No explicit model requested and no fallbacks -> resolve default (original path).
    return withRetry(() => resolveAiProvider(undefined, purpose), { retries });
  }

  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      return await withRetry(() => resolveAiProvider(candidate, purpose), { retries });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("AI model resolution failed for all candidates");
}