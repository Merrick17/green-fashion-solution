/**
 * In-memory AI call metrics (dev/instrumentation only — not persisted).
 * Counters are no-ops to consume; enable via `AI_INSTRUMENTATION=true`.
 */

interface CounterMap {
  calls: Map<string, number>;
  errors: Map<string, number>;
  tools: Map<string, number>;
}

const counters: CounterMap = {
  calls: new Map(),
  errors: new Map(),
  tools: new Map(),
};

function bump(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

export function recordAiCall(label: string): void {
  bump(counters.calls, label);
}

export function recordAiError(label: string): void {
  bump(counters.errors, label);
}

export function recordToolCall(label: string, tool: string, count = 1): void {
  bump(counters.tools, `${label}:${tool}`);
  void count;
}

export function getAiMetrics(): {
  calls: Record<string, number>;
  errors: Record<string, number>;
  tools: Record<string, number>;
} {
  return {
    calls: Object.fromEntries(counters.calls),
    errors: Object.fromEntries(counters.errors),
    tools: Object.fromEntries(counters.tools),
  };
}

export function resetAiMetrics(): void {
  counters.calls.clear();
  counters.errors.clear();
  counters.tools.clear();
}