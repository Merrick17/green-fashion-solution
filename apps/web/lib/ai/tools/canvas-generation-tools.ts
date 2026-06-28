import { tool } from "ai";
import { z } from "zod";
import { MoodItemType, type CreateMoodItemDto } from "@repo/types";
import { createMoodItem, fetchMoodItems, registerProjectFile, updateMoodItem } from "../server/nest-client";
import { generateFashionImage } from "../server/image-gen";
import { buildFashionImagePrompt, inferImageStyle, type FashionImageStyle } from "./image-prompt-builder";
import type { CanvasToolContext } from "./canvas-schemas";

export function createCanvasGenerationTools(ctx: CanvasToolContext) {
  const { moodboardId, client, projectId } = ctx;

  const generateImageTool = tool({
    description: "Generate an AI fashion reference image and add it to the board.",
    inputSchema: z.object({
      prompt: z.string().describe("Subject description: garment, fabric, color, or scene"),
      style: z.enum([
        "editorial-lookbook", "fabric-closeup", "technical-flat",
        "silhouette-sketch", "color-story", "runway-mood",
      ]).optional().describe("Image style type — omit to auto-detect from prompt"),
      season: z.string().optional().describe("Season tag e.g. 'SS26'"),
      x: z.number().default(40),
      y: z.number().default(40),
    }),
    execute: async (params) => {
      try {
        const imageStyle = (params.style as FashionImageStyle | undefined) ?? inferImageStyle(params.prompt);
        const fullPrompt = buildFashionImagePrompt(params.prompt, imageStyle, { season: params.season });
        const imageRef = await generateFashionImage(fullPrompt, { client, moodboardId });
        const isStorageKey =
          !imageRef.startsWith("data:") &&
          !imageRef.startsWith("http://") &&
          !imageRef.startsWith("https://");

        if (projectId && isStorageKey) {
          await registerProjectFile(client, projectId, imageRef, "IMAGE").catch(() => undefined);
        }

        const dto = {
          type: MoodItemType.AI_GENERATED,
          x: params.x,
          y: params.y,
          width: 250,
          height: 250,
          content: isStorageKey
            ? { prompt: fullPrompt, key: imageRef, alt: params.prompt }
            : { prompt: fullPrompt, src: imageRef, alt: params.prompt },
        };
        const item = await createMoodItem(client, moodboardId, dto as unknown as CreateMoodItemDto);
        const usedPlaceholder = imageRef.startsWith("data:image/svg+xml;base64,");
        return usedPlaceholder
          ? { ...item, notice: "Image generation unavailable — placeholder shown. Try again to generate a real image." }
          : item;
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Image generation failed",
          hint: "Try again later or clear the board and regenerate the concept.",
        };
      }
    },
  });

  const generateVariationsTool = tool({
    description: "Generate multiple side-by-side layout variations of an idea on the infinite canvas.",
    inputSchema: z.object({
      basePrompt: z.string().describe("Core description: garment, fabric, or mood"),
      style: z.enum([
        "editorial-lookbook", "fabric-closeup", "technical-flat",
        "silhouette-sketch", "color-story", "runway-mood",
      ]).optional().describe("Consistent style for all variations"),
      season: z.string().optional().describe("Season tag e.g. 'SS26'"),
      variations: z.array(z.string()).describe("Variation modifiers e.g. ['ivory linen', 'forest wool', 'blush silk']"),
      startX: z.number().default(800),
      startY: z.number().default(0),
    }),
    execute: async (params) => {
      const imageStyle = (params.style as FashionImageStyle | undefined) ?? inferImageStyle(params.basePrompt);
      const BATCH = 3;
      const results: Awaited<ReturnType<typeof createMoodItem>>[] = [];

      for (let i = 0; i < params.variations.length; i += BATCH) {
        const batch = params.variations.slice(i, i + BATCH);
        const batchResults = await Promise.all(
          batch.map(async (variation, batchIdx) => {
            const slotX = params.startX + (i + batchIdx) * 340;
            const fullPrompt = buildFashionImagePrompt(
              `${params.basePrompt}, ${variation}`,
              imageStyle,
              { season: params.season },
            );
            const imageRef = await generateFashionImage(fullPrompt, { client, moodboardId });
            const isStorageKey =
              !imageRef.startsWith("data:") &&
              !imageRef.startsWith("http://") &&
              !imageRef.startsWith("https://");
            if (projectId && isStorageKey) {
              await registerProjectFile(client, projectId, imageRef, "IMAGE").catch(() => undefined);
            }
            const dto = {
              type: MoodItemType.AI_GENERATED,
              x: slotX,
              y: params.startY,
              width: 300,
              height: 300,
              content: isStorageKey
                ? { prompt: fullPrompt, key: imageRef, alt: variation }
                : { prompt: fullPrompt, src: imageRef, alt: variation },
            };
            return createMoodItem(client, moodboardId, dto as unknown as CreateMoodItemDto);
          }),
        );
        results.push(...batchResults);
        if (i + BATCH < params.variations.length) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }
      return { generated: results.length, layout: "side-by-side variations" };
    },
  });

  const convertSketchToAssetTool = tool({
    description: "Convert a rough uploaded sketch or image into a polished, structured sourcing component.",
    inputSchema: z.object({ sketchItemId: z.string(), targetStyle: z.string() }),
    execute: async (params) => {
      const items = await fetchMoodItems(client, moodboardId);
      const sketch = items.find((i) => i.id === params.sketchItemId);
      if (!sketch) return { error: "Sketch item not found" };

      const imageRef = await generateFashionImage(
        `High-fidelity polished fashion rendering based on sketch, ${params.targetStyle}`,
        { client, moodboardId },
      );
      const isStorageKey =
        !imageRef.startsWith("data:") &&
        !imageRef.startsWith("http://") &&
        !imageRef.startsWith("https://");
      if (projectId && isStorageKey) {
        await registerProjectFile(client, projectId, imageRef, "IMAGE").catch(() => undefined);
      }
      const updateDto: Record<string, unknown> = {
        type: MoodItemType.AI_GENERATED,
        content: isStorageKey
          ? { prompt: params.targetStyle, key: imageRef, alt: "Polished asset" }
          : { prompt: params.targetStyle, src: imageRef, alt: "Polished asset" },
      };
      await updateMoodItem(client, moodboardId, params.sketchItemId, updateDto);
      return { success: true, message: "Sketch converted into polished asset." };
    },
  });

  return { generateImage: generateImageTool, generateVariations: generateVariationsTool, convertSketchToAsset: convertSketchToAssetTool };
}
