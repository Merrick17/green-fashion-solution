import { tool } from "ai";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import type { AgentContext } from "@repo/types";
import { indexAgentContextToDb, searchProjectRag } from "../rag/rag-service";
import { fetchAgentContext } from "../server/nest-client";
import { isRagEnabled } from "./registry/guards";

export interface RagToolsContext {
  client: AxiosInstance;
  projectId: string;
  revisionMode?: boolean;
  getContext: () => AgentContext | null;
  setContext: (ctx: AgentContext) => void;
}

export function createRagTools(ctx: RagToolsContext) {
  const indexProjectRag = tool({
    description: "Refresh the RAG embedding index for this project's context and assets.",
    inputSchema: z.object({}),
    execute: async () => {
      if (!isRagEnabled()) {
        return { indexed: 0, skipped: true, reason: "RAG disabled" };
      }
      let agentCtx = ctx.getContext();
      if (!agentCtx) {
        agentCtx = await fetchAgentContext(ctx.client, ctx.projectId, ctx.revisionMode);
        ctx.setContext(agentCtx);
      }
      await indexAgentContextToDb(ctx.client, ctx.projectId, agentCtx);
      return { indexed: true };
    },
  });

  const searchProjectRagTool = tool({
    description: "Semantic search over project brief, moodboards, assets, and prior proposals.",
    inputSchema: z.object({
      query: z.string(),
      topK: z.number().min(1).max(20).optional(),
    }),
    execute: async ({ query, topK }) => {
      if (!isRagEnabled()) {
        return { hits: [], disabled: true };
      }
      const hits = await searchProjectRag(ctx.client, ctx.projectId, query, topK ?? 8);
      return { query, hits };
    },
  });

  return { indexProjectRag, searchProjectRag: searchProjectRagTool };
}
