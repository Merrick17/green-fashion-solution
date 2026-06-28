import { tool } from "ai";
import { z } from "zod";
import type { AxiosInstance } from "axios";
import {
  addCollectionItem,
  createCollection,
  listCollections,
  reorderCollectionItems,
} from "../../server/nest-client";

export function createDesignerCollectionTools(ctx: { client: AxiosInstance }) {
  const listCollectionsTool = tool({
    description: "List your designer collections in the sourcing library.",
    inputSchema: z.object({}),
    execute: async () => {
      const result = await listCollections(ctx.client, { limit: 50 });
      return {
        count: result.data.length,
        collections: result.data.map((c) => ({
          id: c.id,
          name: c.name,
          itemCount: c.items?.length ?? 0,
        })),
      };
    },
  });

  const createCollectionTool = tool({
    description: "Create a new collection to organize sourcing assets.",
    inputSchema: z.object({
      name: z.string(),
      description: z.string().optional(),
    }),
    execute: async (dto) => {
      const col = await createCollection(ctx.client, dto);
      return { id: col.id, name: col.name };
    },
  });

  const addToCollection = tool({
    description: "Add a fabric or product asset to a collection.",
    inputSchema: z.object({
      collectionId: z.string(),
      fabricAssetId: z.string().optional(),
      productAssetId: z.string().optional(),
    }),
    execute: async ({ collectionId, fabricAssetId, productAssetId }) => {
      await addCollectionItem(ctx.client, collectionId, { fabricAssetId, productAssetId });
      return { ok: true, collectionId };
    },
  });

  const reorderCollectionItemsTool = tool({
    description: "Reorder items within a collection.",
    inputSchema: z.object({
      collectionId: z.string(),
      itemIds: z.array(z.string()),
    }),
    execute: async ({ collectionId, itemIds }) => {
      const col = await reorderCollectionItems(ctx.client, collectionId, itemIds);
      return { id: col.id, itemCount: col.items?.length ?? 0 };
    },
  });

  return {
    listCollections: listCollectionsTool,
    createCollection: createCollectionTool,
    addToCollection,
    reorderCollectionItems: reorderCollectionItemsTool,
  };
}
