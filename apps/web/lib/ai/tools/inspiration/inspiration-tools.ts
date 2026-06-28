import { tool } from "ai";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import { InspirationAction } from "@repo/types";
import { listInspirationAssets, selectInspirationAsset } from "../../server/nest-client";

export interface InspirationToolsContext {
  client: AxiosInstance;
  projectId: string;
}

export function createInspirationTools(ctx: InspirationToolsContext) {
  const browseInspirationAssets = tool({
    description: "Browse curated designer fabrics and product references the customer can select for proposal curation.",
    inputSchema: z.object({}),
    execute: async () => {
      const assets = await listInspirationAssets(ctx.client, ctx.projectId);
      return {
        count: assets.length,
        assets: assets.slice(0, 30).map((a) => ({
          id: a.id,
          type: a.type,
          name: a.name,
          imageUrl: a.imageUrl,
          selected: a.selections?.some((s) => s.action === "SELECTED") ?? false,
        })),
      };
    },
  });

  const selectInspirationAssetTool = tool({
    description: "Mark a curated asset as SELECTED for admin proposal curation.",
    inputSchema: z.object({
      fabricAssetId: z.string().optional(),
      productAssetId: z.string().optional(),
      action: z.nativeEnum(InspirationAction).optional(),
    }),
    execute: async ({ fabricAssetId, productAssetId, action }) => {
      const resolved = action ?? InspirationAction.SELECTED;
      await selectInspirationAsset(ctx.client, {
        projectId: ctx.projectId,
        fabricAssetId,
        productAssetId,
        action: resolved,
      });
      return { ok: true, fabricAssetId, productAssetId, action: resolved };
    },
  });

  return { browseInspirationAssets, selectInspirationAsset: selectInspirationAssetTool };
}
