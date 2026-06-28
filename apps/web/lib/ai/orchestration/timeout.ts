/**
 * Compose an optional caller-provided AbortSignal with an optional timeout.
 *
 * Non-breaking by design:
 * - No timeout AND no caller signal  -> signal is `undefined` (streamText runs
 *   exactly as before, with no abort signal attached).
 * - Only a caller signal              -> that signal is returned directly.
 * - A timeout (with or without a caller signal) -> a controller whose signal
 *   aborts after `timeoutMs`; a caller abort propagates through it too.
 *
 * `clear()` cancels the pending timer. Call it from the stream's onFinish /
 * onError hooks so a successful/failed stream does not leave a dangling timer.
 */
export interface ComposedAbort {
  signal: AbortSignal | undefined;
  clear: () => void;
}

const NO_TIMEOUT = { signal: undefined, clear: () => {} } satisfies ComposedAbort;

export function composeAbortSignal(
  callerSignal?: AbortSignal,
  timeoutMs?: number,
): ComposedAbort {
  const hasTimeout = !!timeoutMs && timeoutMs > 0;

  if (!hasTimeout && !callerSignal) return NO_TIMEOUT;
  if (!hasTimeout && callerSignal) {
    return { signal: callerSignal, clear: () => {} };
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new Error(`AI request timed out after ${timeoutMs}ms`)),
    timeoutMs as number,
  );

  const onCallerAbort = () => {
    if (callerSignal) controller.abort(callerSignal.reason);
  };

  if (callerSignal) {
    if (callerSignal.aborted) {
      controller.abort(callerSignal.reason);
    } else {
      callerSignal.addEventListener("abort", onCallerAbort, { once: true });
    }
  }

  return {
    signal: controller.signal,
    clear: () => {
      clearTimeout(timer);
      if (callerSignal) callerSignal.removeEventListener("abort", onCallerAbort);
    },
  };
}