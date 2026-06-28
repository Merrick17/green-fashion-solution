import { tool } from "ai";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import type { AgentContext } from "@repo/types";
import { fetchAgentContext } from "../../server/nest-client";
import { searchProjectRag } from "../../rag/rag-service";
import {
  parseRagAssetBoosts,
  rankAssetsDeterministic,
  rankAssetsWithEmbeddings,
} from "../proposal/rank-assets";
import { assetSearchText } from "@repo/utils";
import { isRagEnabled } from "../registry/guards";

export interface SearchToolsContext {
  client: AxiosInstance;
  projectId: string;
  revisionMode?: boolean;
  getContext: () => AgentContext | null;
  setContext: (ctx: AgentContext) => void;
}

export function createSearchTools(ctx: SearchToolsContext) {
  const findAssets = tool({
    description:
      "Find fabric and product assets for a proposal. Combines moodboard signals, semantic search, and keyword matching. Use this for ALL asset discovery — do not call rankAssets or searchSourcingLibrary separately.",
    inputSchema: z.object({
      query: z.string().optional().describe(
        "Keywords from the brief or moodboard: fabric type, color, season, aesthetic — e.g. 'lightweight linen SS26 ecru'"
      ),
      focus: z.enum(["fabric", "product", "all"]).default("all"),
      category: z.string().optional().describe("Garment category filter: 'outerwear', 'tops', 'knitwear', etc."),
      limit: z.number().min(1).max(30).default(15),
    }),
    execute: async ({ query, focus, limit, category }) => {
      let agentCtx = ctx.getContext();
      if (!agentCtx) {
        agentCtx = await fetchAgentContext(ctx.client, ctx.projectId, ctx.revisionMode);
        ctx.setContext(agentCtx);
      }

      const q = query?.toLowerCase().trim();
      let ragBoosts: Map<string, number> | undefined;

      if (isRagEnabled() && q) {
        const hits = await searchProjectRag(ctx.client, ctx.projectId, q, 16);
        ragBoosts = parseRagAssetBoosts(hits);
      }

      const ranked = q
        ? await rankAssetsWithEmbeddings(agentCtx, q, focus ?? "all", ragBoosts)
        : rankAssetsDeterministic(agentCtx, focus ?? "all", ragBoosts);

      type RankedItem = { id: string; name: string; score: number };
      const filterItems = (
        items: RankedItem[],
        assets: AgentContext["assets"]["fabrics"],
      ): RankedItem[] => {
        let result = items;
        if (q) {
          result = result.filter((item) => {
            const asset = assets.find((a) => a.id === item.id);
            if (!asset) return false;
            const corpus = assetSearchText({
              title: asset.name,
              description: asset.description,
              imageUrl: asset.imageUrl,
              keywords: asset.keywords,
            });
            return corpus.includes(q) || (ragBoosts?.has(item.id) ?? false);
          });
        }
        if (category) {
          result = result.filter((item) => {
            const asset = assets.find((a) => a.id === item.id);
            if (!asset) return true;
            const corpus = assetSearchText({
              title: asset.name,
              description: asset.description,
              imageUrl: asset.imageUrl,
              keywords: asset.keywords,
            });
            return corpus.includes(category.toLowerCase());
          });
        }
        return result.slice(0, limit ?? 15);
      };

      const topFabrics = focus === "product" ? [] : filterItems(ranked.fabrics, agentCtx.assets.fabrics);
      const topProducts = focus === "fabric" ? [] : filterItems(ranked.products, agentCtx.assets.products);

      return {
        query: q ?? null,
        category: category ?? null,
        ragBoosted: Boolean(ragBoosts?.size),
        topFabrics: topFabrics.map((f) => ({ id: f.id, name: f.name, score: f.score })),
        topProducts: topProducts.map((p) => ({ id: p.id, name: p.name, score: p.score })),
        totalFabrics: topFabrics.length,
        totalProducts: topProducts.length,
      };
    },
  });

  const searchSourcingLibrary = tool({
    description:
      "Search designer fabrics and products by keyword. Prefer findAssets which handles semantic + keyword + moodboard signals in one call.",
    inputSchema: z.object({
      query: z.string().optional(),
      focus: z.enum(["fabric", "product", "all"]).optional(),
      limit: z.number().min(1).max(30).optional(),
    }),
    execute: async ({ query, focus, limit }) => {
      let agentCtx = ctx.getContext();
      if (!agentCtx) {
        agentCtx = await fetchAgentContext(ctx.client, ctx.projectId, ctx.revisionMode);
        ctx.setContext(agentCtx);
      }

      const q = query?.toLowerCase().trim();
      let ragBoosts: Map<string, number> | undefined;

      if (isRagEnabled() && q) {
        const hits = await searchProjectRag(ctx.client, ctx.projectId, q, 16);
        ragBoosts = parseRagAssetBoosts(hits);
      }

      const ranked = q
        ? await rankAssetsWithEmbeddings(agentCtx, q, focus ?? "all", ragBoosts)
        : rankAssetsDeterministic(agentCtx, focus ?? "all", ragBoosts);

      const filterByQuery = (
        items: Array<{ id: string; name: string; score: number; type: string }>,
        assets: AgentContext["assets"]["fabrics"],
      ) => {
        if (!q) return items;
        return items.filter((item) => {
          const asset = assets.find((a) => a.id === item.id);
          if (!asset) return false;
          return assetSearchText({
            title: asset.name,
            description: asset.description,
            imageUrl: asset.imageUrl,
            keywords: asset.keywords,
          }).includes(q);
        });
      };

      const topFabrics = filterByQuery(ranked.fabrics, agentCtx.assets.fabrics).slice(
        0,
        limit ?? 15,
      );
      const topProducts = filterByQuery(ranked.products, agentCtx.assets.products).slice(
        0,
        limit ?? 15,
      );

      return {
        query: q,
        keywords: ranked.keywords,
        ragBoosted: Boolean(ragBoosts?.size),
        topFabrics,
        topProducts,
      };
    },
  });

  return { findAssets, searchSourcingLibrary };
}
