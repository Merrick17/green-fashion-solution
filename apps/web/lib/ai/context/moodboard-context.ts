import type { CanvasViewport, MoodItem, Moodboard } from "@repo/types";
import { summarizeItemContent } from "@/lib/canvas/moodboard-item-utils";
import type { CanvasContextPayload } from "../types";

export interface MoodboardAgentContextInput {
  items: MoodItem[];
  viewport?: CanvasViewport;
  moodboard?: Pick<Moodboard, "styleDirection" | "colorPalette" | "fabricSuggestions" | "mood">;
  selectedItemIds?: string[];
  projectId?: string;
}

export function buildCanvasContextPayload(input: MoodboardAgentContextInput): CanvasContextPayload {
  return {
    items: input.items.map((item) => ({
      id: item.id,
      type: item.type,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      rotation: item.rotation,
      zIndex: item.zIndex,
      content: summarizeItemContent(item),
    })),
    viewport: input.viewport,
    styleDirection: input.moodboard?.styleDirection,
    colorPalette: input.moodboard?.colorPalette,
    fabricSuggestions: input.moodboard?.fabricSuggestions,
    mood: input.moodboard?.mood,
    selectedItemIds: input.selectedItemIds,
    projectId: input.projectId,
  };
}

export function buildMoodboardContextMessages(ctx?: CanvasContextPayload): Array<{ role: "system"; content: string }> {
  if (!ctx) {
    return [{ role: "system", content: "The canvas is currently empty." }];
  }

  const parts: string[] = [
    "You are co-designing a moodboard on a tldraw canvas. Mood items are synced as tldraw shapes (text, images, color swatches, embeds). Use canvas tools to create and arrange items.",
  ];

  if (ctx.styleDirection || ctx.mood) {
    parts.push(
      `Moodboard metadata: styleDirection="${ctx.styleDirection ?? ""}", mood="${ctx.mood ?? ""}", colors=${JSON.stringify(ctx.colorPalette ?? [])}, fabrics=${JSON.stringify(ctx.fabricSuggestions ?? [])}`,
    );
  }

  if (ctx.selectedItemIds?.length) {
    parts.push(`User selected item IDs on canvas: ${ctx.selectedItemIds.join(", ")}`);
  }

  if (ctx.viewport) {
    parts.push(`Camera viewport (x, y, zoom): ${JSON.stringify(ctx.viewport)}`);
  }

  if (ctx.items?.length) {
    const MAX_ITEMS = 40;
    const visible = ctx.items.slice(0, MAX_ITEMS);
    const overflow = ctx.items.length - visible.length;
    parts.push(
      `Canvas items (${visible.length}${overflow > 0 ? ` of ${ctx.items.length} — oldest ${overflow} omitted` : ""}) — use IDs for updateItem/moveItem/deleteItem:`,
      JSON.stringify(visible, null, 2),
    );
  } else {
    parts.push("The canvas is currently empty.");
  }

  if (ctx.projectId) {
    parts.push(`Project ID for file uploads: ${ctx.projectId}`);
  }

  return [{ role: "system", content: parts.join("\n") }];
}
