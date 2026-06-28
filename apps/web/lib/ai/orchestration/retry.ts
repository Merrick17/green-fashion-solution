/**
 * Generic retry with exponential backoff.
 *
 * Used ONLY for the synchronous setup phase of an AI run (provider resolution,
 * message conversion) — never for the streaming phase, where retrying after a
 * stream has started would be unsafe. Default `retries: 0` means a single
 * attempt (no retry) -> identical to calling the function directly.
 */
export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  isRetryable?: (error: unknown) => boolean;
}

const DEFAULT_RETRYABLE = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  // Transient-looking provider/network failures. Never retry auth/key errors.
  if (/API_KEY|Unauthorized|Forbidden|invalid/i.test(message)) return false;
  return /timeout|timed out|ECONNRESET|ETIMEDOUT|fetch failed|429|503|socket hang up/i.test(
    message,
  );
};

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const retries = Math.max(0, options.retries ?? 0);
  const baseDelay = options.baseDelayMs ?? 500;
  const maxDelay = options.maxDelayMs ?? 8000;
  const isRetryable = options.isRetryable ?? DEFAULT_RETRYABLE;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isRetryable(error)) throw error;
      const delay = Math.min(maxDelay, baseDelay * 2 ** attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}