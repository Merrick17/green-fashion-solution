/**
 * Lightweight structured AI logger. OFF by default (no env set -> emits nothing,
 * preserving prior console behaviour). Enable via `AI_LOG_LEVEL=debug|info|warn|error`.
 * Never throws — logging is best-effort.
 */
import type { LogLevel } from "@repo/types";

export type AiLogLevel = LogLevel;

const LEVEL_RANK: Record<AiLogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function threshold(): number {
  const env = (process.env.AI_LOG_LEVEL ?? "").toLowerCase();
  if (!env) return Number.POSITIVE_INFINITY; // unset -> log nothing
  return LEVEL_RANK[env as AiLogLevel] ?? Number.POSITIVE_INFINITY;
}

export function aiLog(
  level: AiLogLevel,
  event: string,
  fields?: Record<string, unknown>,
): void {
  if (LEVEL_RANK[level] < threshold()) return;
  const payload = {
    level,
    event,
    ts: new Date().toISOString(),
    ...(fields ?? {}),
  };
  try {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(payload));
  } catch {
    /* best-effort: never let logging throw */
  }
}