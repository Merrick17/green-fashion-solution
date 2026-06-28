import type { AxiosInstance } from "axios";
import type { AgentContext } from "@repo/types";
import { buildRagContextFromAgentContext } from "./rag-service";
import { aiLog } from "../orchestration/ai-logger";

/**
 * RAG toggle + non-blocking wrapper.
 *
 * Resolution rules (preserve prior behaviour):
 * - `AI_ENABLE_RAG === "false"` is a global kill switch -> RAG off (as today).
 * - A per-request `enableRag === false` disables RAG for that request.
 * - Otherwise RAG is on (the current default).
 *
 * `safeBuildRagContext` wraps the retrieval pipeline in try/catch so a RAG
 * failure NEVER breaks the proposal run — it logs and proceeds with no RAG
 * context (empty string), matching the "RAG is supporting, not required" rule.
 */
export function resolveRagEnabled(perRequest?: boolean): boolean {
  if (process.env.AI_ENABLE_RAG === "false") return false;
  if (perRequest === false) return false;
  return true;
}

function errorToString(error: unknown): string {
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export async function safeBuildRagContext(
  client: AxiosInstance,
  projectId: string,
  ctx: AgentContext,
  query: string,
  perRequest?: boolean,
): Promise<string> {
  if (!resolveRagEnabled(perRequest)) return "";

  try {
    return await buildRagContextFromAgentContext(client, projectId, ctx, query);
  } catch (error) {
    aiLog("warn", "rag_non_blocking_failure", {
      projectId,
      error: errorToString(error),
    });
    return "";
  }
}