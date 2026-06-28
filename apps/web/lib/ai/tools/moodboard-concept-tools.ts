// Concept & refinement tools for the moodboard agent.
//
// All planner tools are NON-MUTATING: they return structured plans validated
// via tool() + Zod. The agent materializes changes through the existing item
// tools or via materializeRefinement (which executes a refineMoodboard plan
// in 2 agent calls instead of N+1).

import { tool } from "ai";
import { z } from "zod";
import { MoodItemType, type CreateMoodItemDto } from "@repo/types";
import {
  batchUpdateMoodItems,
  createMoodItem,
  fetchMoodItems,
  registerProjectFile,
} from "../server/nest-client";
import { generateFashionImage } from "../server/image-gen";
import { analyzeBoardComposition, applyLayoutStrategy, type LayoutKind } from "./layout-strategies";
import { conceptSchema, buildMoodboardInputSchema } from "./concept-layout";
import { materializeConceptLayout } from "./concept-materialize";
import type { CanvasToolContext } from "./canvas-tools";

const editSchema = z.object({
  id: z.string().describe("Existing item id to edit (must already be on the board)"),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  hex: z.string().optional().describe("New hex for a COLOR item"),
  text: z.string().optional().describe("New text for a TEXT item"),
  groupId: z.string().optional(),
});

const additionSchema = z.object({
  kind: z.enum(["image", "swatch", "text"]),
  prompt: z.string().optional().describe("Required when kind=image"),
  hex: z.string().optional().describe("Required when kind=swatch"),
  text: z.string().optional().describe("Required when kind=text"),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

const suggestionsSchema = z.object({
  newImages: z
    .array(
      z.object({
        prompt: z.string(),
        suggestedPosition: z.object({ x: z.number(), y: z.number() }),
      }),
    )
    .describe("Image prompts worth generating, with a suggested canvas position"),
  missingPaletteColors: z.array(z.string()).describe("Hex colors that would complete the palette"),
  stylingImprovements: z.array(z.string()).describe("Concrete styling improvements"),
  layoutSuggestions: z.array(z.string()).describe("Layout adjustments to consider"),
});

export function createConceptTools(ctx: CanvasToolContext) {
  const { moodboardId, client, projectId, enableImage } = ctx;

  const generateMoodboardConceptTool = tool({
    description:
      "Call FIRST for a new vibe/season/collection. Returns { theme, mood, palette, styleKeywords, layoutSuggestion, imagePrompts }. Pass this exact object to generateTldrawMoodboard after setMoodboardMetadata.",
    inputSchema: conceptSchema,
    execute: async (concept) => concept,
  });

  const generateTldrawMoodboardTool = tool({
    description:
      "Build the full moodboard on the canvas from a creative concept: color swatches, text notes, and AI images. Pass the EXACT object returned by generateMoodboardConcept (fields: theme, mood, palette, styleKeywords, layoutSuggestion, imagePrompts). Do NOT pass moodboardMetadata or setMoodboardMetadata output — if you only have board metadata, still include theme/mood/palette/imagePrompts at the top level.",
    inputSchema: buildMoodboardInputSchema,
    execute: async (concept) => {
      try {
        const result = await materializeConceptLayout(
          { client, moodboardId, projectId, enableImage },
          concept,
        );
        return {
          ...result,
          message: `Moodboard built: ${result.created} items (${result.images} images), layout ${result.layout}.`,
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Failed to build moodboard",
          hint: "Retry the build or ask to place items individually.",
        };
      }
    },
  });

  const refineMoodboardTool = tool({
    description:
      "Plan targeted edits to the existing board. Returns acceptedEdits, additions, layoutHint. Always follow with materializeRefinement to apply the plan.",
    inputSchema: z.object({
      instruction: z.string(),
      preserveStructure: z.boolean().default(true),
      edits: z.array(editSchema).default([]),
      additions: z.array(additionSchema).default([]),
      layoutHint: z.enum(["keep", "grid", "masonry", "circular", "collage", "editorial-grid", "fashion"]).default("keep"),
    }),
    execute: async (plan) => {
      const items = await fetchMoodItems(client, moodboardId);
      const knownIds = new Set(items.map((i) => i.id));
      const acceptedEdits = plan.edits.filter((e) => knownIds.has(e.id));
      const rejectedEditIds = plan.edits
        .filter((e) => !knownIds.has(e.id))
        .map((e) => e.id);
      return {
        summary: analyzeBoardComposition(items),
        acceptedEdits,
        rejectedEditIds,
        additions: plan.additions,
        layoutHint: plan.layoutHint,
        preserveStructure: plan.preserveStructure,
        hint: "Call materializeRefinement with this plan to apply all edits and additions in one step.",
      };
    },
  });

  const materializeRefinementTool = tool({
    description:
      "Execute a refinement plan returned by refineMoodboard. Applies all accepted edits via batch update, creates additions (images generated concurrently), and optionally re-layouts. Use this instead of calling updateItem/createItem/generateImage individually after refineMoodboard.",
    inputSchema: z.object({
      acceptedEdits: z.array(editSchema),
      additions: z.array(additionSchema),
      layoutHint: z
        .enum(["keep", "grid", "masonry", "circular", "collage", "editorial-grid", "fashion"])
        .default("keep"),
    }),
    execute: async ({ acceptedEdits, additions, layoutHint }) => {
      // 1. Apply batch edits
      let applied = 0;
      if (acceptedEdits.length > 0) {
        const editPatches = acceptedEdits.map((e) => {
          const patch: Record<string, unknown> = { id: e.id };
          if (e.x !== undefined) patch.x = e.x;
          if (e.y !== undefined) patch.y = e.y;
          if (e.width !== undefined) patch.width = e.width;
          if (e.height !== undefined) patch.height = e.height;
          if (e.groupId !== undefined) patch.groupId = e.groupId;
          if (e.hex !== undefined) patch.content = { hex: e.hex };
          if (e.text !== undefined) patch.content = { text: e.text };
          return patch as { id: string } & Record<string, unknown>;
        });
        await batchUpdateMoodItems(client, moodboardId, editPatches);
        applied = editPatches.length;
      }

      // 2. Create additions — images concurrently, non-images synchronously
      let created = 0;
      const imagePlans = additions.filter((a) => a.kind === "image");
      const nonImagePlans = additions.filter((a) => a.kind !== "image");

      // Non-image additions (swatches, text)
      for (const add of nonImagePlans) {
        if (add.kind === "swatch") {
          await createMoodItem(client, moodboardId, {
            type: MoodItemType.COLOR,
            x: add.x, y: add.y, width: add.width, height: add.height,
            content: { hex: add.hex ?? "#cccccc" },
          } as unknown as CreateMoodItemDto);
        } else {
          await createMoodItem(client, moodboardId, {
            type: MoodItemType.TEXT,
            x: add.x, y: add.y, width: add.width, height: add.height,
            content: { text: add.text ?? "" },
          } as unknown as CreateMoodItemDto);
        }
        created++;
      }

      // Image additions — concurrent
      if (imagePlans.length > 0) {
        const imageResults = await Promise.all(
          imagePlans.map(async (add) => {
            if (!add.prompt) return null;
            try {
              const imageRef = await generateFashionImage(add.prompt, { client, moodboardId });
              const isStorageKey =
                !imageRef.startsWith("data:") &&
                !imageRef.startsWith("http://") &&
                !imageRef.startsWith("https://");
              if (projectId && isStorageKey) {
                await registerProjectFile(client, projectId, imageRef, "IMAGE").catch(() => undefined);
              }
              return createMoodItem(client, moodboardId, {
                type: MoodItemType.AI_GENERATED,
                x: add.x, y: add.y, width: add.width, height: add.height,
                content: isStorageKey
                  ? { prompt: add.prompt, key: imageRef, alt: add.prompt }
                  : { prompt: add.prompt, src: imageRef, alt: add.prompt },
              } as unknown as CreateMoodItemDto);
            } catch {
              return null;
            }
          }),
        );
        created += imageResults.filter(Boolean).length;
      }

      // 3. Optional re-layout
      let layoutApplied = false;
      if (layoutHint !== "keep") {
        const allItems = await fetchMoodItems(client, moodboardId);
        const layoutUpdates = applyLayoutStrategy(allItems, layoutHint as LayoutKind);
        await batchUpdateMoodItems(client, moodboardId, layoutUpdates);
        layoutApplied = true;
      }

      return {
        applied,
        created,
        layout: layoutApplied ? layoutHint : "unchanged",
        message: `Refinement applied: ${applied} edits, ${created} additions${layoutApplied ? `, layout ${layoutHint}` : ""}.`,
      };
    },
  });

  const suggestAdditionsTool = tool({
    description:
      "Suggest additions/improvements for the current board: new images to generate, missing palette colors, styling improvements, and layout suggestions. Read-only — returns suggestions; act on them with the existing item tools.",
    inputSchema: z.object({
      focus: z.string().optional().describe("Optional area to focus suggestions on"),
      suggestions: suggestionsSchema,
    }),
    execute: async ({ focus, suggestions }) => {
      const items = await fetchMoodItems(client, moodboardId);
      return {
        focus: focus ?? null,
        currentState: analyzeBoardComposition(items),
        suggestions,
      };
    },
  });

  return {
    generateMoodboardConcept: generateMoodboardConceptTool,
    generateTldrawMoodboard: generateTldrawMoodboardTool,
    refineMoodboard: refineMoodboardTool,
    materializeRefinement: materializeRefinementTool,
    suggestAdditions: suggestAdditionsTool,
  };
}
