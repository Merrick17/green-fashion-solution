import { tool } from "ai";
import { z } from "zod";
import { MoodItemType, type CreateMoodItemDto } from "@repo/types";
import {
  batchUpdateMoodItems,
  createMoodItem,
  fetchMoodItems,
  updateMoodboard,
} from "../server/nest-client";
import { applyLayoutStrategy, analyzeBoardComposition, type LayoutKind } from "./layout-strategies";
import { textContent, colorContent, linkContent, type CanvasToolContext } from "./canvas-schemas";

export function createCanvasLayoutTools(ctx: CanvasToolContext) {
  const { moodboardId, client } = ctx;

  const bulkCreateItemsTool = tool({
    description:
      "Create multiple non-image canvas items (TEXT, COLOR, LINK) in a single call. Use instead of calling createItem repeatedly for swatches, text labels, or links.",
    inputSchema: z.object({
      items: z.array(
        z.discriminatedUnion("type", [
          z.object({ type: z.literal("TEXT"),  x: z.number(), y: z.number(), width: z.number().default(160), height: z.number().default(60),  content: textContent }),
          z.object({ type: z.literal("COLOR"), x: z.number(), y: z.number(), width: z.number().default(120), height: z.number().default(120), content: colorContent }),
          z.object({ type: z.literal("LINK"),  x: z.number(), y: z.number(), width: z.number().default(160), height: z.number().default(50),  content: linkContent }),
        ]),
      ).min(1).max(12),
    }),
    execute: async ({ items }) => {
      const created = await Promise.all(
        items.map((item) =>
          createMoodItem(client, moodboardId, {
            type: item.type as MoodItemType,
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
            content: item.content as Record<string, unknown>,
          } as unknown as CreateMoodItemDto),
        ),
      );
      return { created: created.length, ids: created.map((i) => i.id) };
    },
  });

  const autoLayoutTool = tool({
    description: "Automatically arrange all items on the canvas using a named layout strategy.",
    inputSchema: z.object({
      layout: z.enum(["grid", "masonry", "circular", "color-flow", "collage", "editorial-grid", "fashion"]),
    }),
    execute: async ({ layout }) => {
      const items = await fetchMoodItems(client, moodboardId);
      const updates = applyLayoutStrategy(items, layout as LayoutKind);
      return batchUpdateMoodItems(client, moodboardId, updates);
    },
  });

  const analyzeBoardTool = tool({
    description: "Analyze the current board composition before making layout suggestions.",
    inputSchema: z.object({}),
    execute: async () => {
      const items = await fetchMoodItems(client, moodboardId);
      return analyzeBoardComposition(items);
    },
  });

  const setMoodboardMetadataTool = tool({
    description: "Update moodboard style direction, color palette, fabric suggestions, or mood text.",
    inputSchema: z.object({
      styleDirection: z.string().optional(),
      colorPalette: z.array(z.string()).max(6).optional(),
      fabricSuggestions: z.array(z.string()).optional(),
      mood: z.string().optional(),
    }),
    execute: async (params) => updateMoodboard(client, moodboardId, params),
  });

  const applyGlobalVibeTool = tool({
    description:
      "Re-style the entire canvas based on a vibe prompt: updates metadata and re-colors COLOR swatches, then re-layouts. Does NOT modify TEXT items.",
    inputSchema: z.object({
      vibePrompt: z.string(),
      newColorPalette: z.array(z.string()).max(6),
      newMood: z.string(),
    }),
    execute: async (params) => {
      await updateMoodboard(client, moodboardId, {
        colorPalette: params.newColorPalette,
        mood: params.newMood,
        styleDirection: params.vibePrompt,
      });

      const items = await fetchMoodItems(client, moodboardId);
      let colorIndex = 0;
      const updates = items
        .filter((item) => item.type === MoodItemType.COLOR)
        .map((item) => {
          const newColor = params.newColorPalette[colorIndex % params.newColorPalette.length] ?? "#000000";
          colorIndex++;
          return { id: item.id, content: { ...item.content as object, hex: newColor } };
        });

      if (updates.length > 0) {
        await batchUpdateMoodItems(client, moodboardId, updates);
      }

      const updatedItems = await fetchMoodItems(client, moodboardId);
      const layoutUpdates = applyLayoutStrategy(updatedItems, "masonry");
      await batchUpdateMoodItems(client, moodboardId, layoutUpdates);

      return {
        success: true,
        message: `Global vibe applied: ${updates.length} swatches recolored, canvas reorganized.`,
      };
    },
  });

  return {
    bulkCreateItems: bulkCreateItemsTool,
    autoLayout: autoLayoutTool,
    analyzeBoard: analyzeBoardTool,
    setMoodboardMetadata: setMoodboardMetadataTool,
    applyGlobalVibe: applyGlobalVibeTool,
  };
}
