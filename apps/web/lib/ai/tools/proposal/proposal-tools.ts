import { tool } from "ai";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import type { AgentContext } from "@repo/types";
import { fetchAgentContext } from "../../server/nest-client";
import { rankAssetsDeterministic, rankAssetsWithEmbeddings, parseRagAssetBoosts } from "./rank-assets";
import { searchProjectRag } from "../../rag/rag-service";
import { isRagEnabled } from "../registry/guards";

export interface ProposalToolsContext {
  client: AxiosInstance;
  projectId: string;
  revisionMode?: boolean;
  getContext: () => AgentContext | null;
  setContext: (ctx: AgentContext) => void;
}

export function createProposalCoreTools(ctx: ProposalToolsContext) {
  const loadProjectContext = tool({
    description: "Load aggregated project context: moodboards, tasks, designer assets, prior proposals.",
    inputSchema: z.object({}),
    execute: async () => {
      const data = await fetchAgentContext(ctx.client, ctx.projectId, ctx.revisionMode);
      ctx.setContext(data);
      return {
        projectId: data.project.id,
        moodboardCount: data.moodboards.length,
        fabricCount: data.assets.fabrics.length,
        productCount: data.assets.products.length,
        priorProposalCount: data.priorProposals.length,
        hasInspirationSelections: Boolean(data.inspirationSelections?.length),
      };
    },
  });

  const rankAssets = tool({
    description: "Score designer fabrics and products against moodboard signals. Returns ranked lists with scores.",
    inputSchema: z.object({
      focus: z.enum(["fabric", "product", "all"]).optional(),
      query: z.string().optional(),
    }),
    execute: async ({ focus, query }) => {
      let agentCtx = ctx.getContext();
      if (!agentCtx) {
        agentCtx = await fetchAgentContext(ctx.client, ctx.projectId, ctx.revisionMode);
        ctx.setContext(agentCtx);
      }

      let ragBoosts: Map<string, number> | undefined;
      if (isRagEnabled() && query?.trim()) {
        const hits = await searchProjectRag(ctx.client, ctx.projectId, query.trim(), 12);
        ragBoosts = parseRagAssetBoosts(hits);
      }

      const ranked = query?.trim()
        ? await rankAssetsWithEmbeddings(agentCtx, query.trim(), focus ?? "all", ragBoosts)
        : rankAssetsDeterministic(agentCtx, focus ?? "all", ragBoosts);

      return {
        keywords: ranked.keywords,
        topFabrics: ranked.fabrics.slice(0, 15),
        topProducts: ranked.products.slice(0, 15),
      };
    },
  });

  return { loadProjectContext, rankAssets };
}

/** @deprecated use createProposalCoreTools + buildProposalSections */
export function createProposalTools(ctx: ProposalToolsContext) {
  return createProposalCoreTools(ctx);
}
