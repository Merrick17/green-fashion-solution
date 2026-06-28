import { MoodItemType, type MoodItem } from "@repo/types";
import type { AxiosInstance } from "axios";
import { generateFashionImage } from "../server/image-gen";
import {
  createMoodItem,
  registerProjectFile,
  type CreateMoodItemBody,
} from "../server/nest-client";
import { planConceptLayout, type Concept, type ConceptLayout } from "./concept-layout";
import { buildFashionImagePrompt, inferImageStyle, type FashionImageStyle } from "./image-prompt-builder";

export interface MaterializeContext {
  client: AxiosInstance;
  moodboardId: string;
  projectId?: string;
  enableImage?: boolean;
}

async function createImageItem(
  ctx: MaterializeContext,
  prompt: string,
  x: number,
  y: number,
  width: number,
  height: number,
): Promise<MoodItem> {
  const imageRef = await generateFashionImage(prompt, {
    client: ctx.client,
    moodboardId: ctx.moodboardId,
  });
  const isStorageKey =
    !imageRef.startsWith("data:") &&
    !imageRef.startsWith("http://") &&
    !imageRef.startsWith("https://");

  if (ctx.projectId && isStorageKey) {
    await registerProjectFile(ctx.client, ctx.projectId, imageRef, "IMAGE").catch(() => undefined);
  }

  const dto: CreateMoodItemBody = {
    type: MoodItemType.AI_GENERATED,
    x,
    y,
    width,
    height,
    content: isStorageKey
      ? { prompt, key: imageRef, alt: prompt }
      : { prompt, src: imageRef, alt: prompt },
  };
  return createMoodItem(ctx.client, ctx.moodboardId, dto);
}

export async function materializeConceptLayout(
  ctx: MaterializeContext,
  concept: Concept,
): Promise<{
  layout: ConceptLayout;
  created: number;
  images: number;
  itemIds: string[];
}> {
  const { layout, placements } = planConceptLayout(concept);
  const itemIds: string[] = [];
  const imagePlacements = placements.filter((p) => p.kind === "image");

  for (const placement of placements) {
    if (placement.kind === "image") continue;

    if (placement.kind === "swatch") {
      const item = await createMoodItem(ctx.client, ctx.moodboardId, {
        type: MoodItemType.COLOR,
        x: placement.x,
        y: placement.y,
        width: placement.width,
        height: placement.height,
        rotation: placement.rotation ?? 0,
        content: { hex: placement.hex ?? "#cccccc", name: placement.hex },
      });
      itemIds.push(item.id);
      continue;
    }

    const item = await createMoodItem(ctx.client, ctx.moodboardId, {
      type: MoodItemType.TEXT,
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
      rotation: placement.rotation ?? 0,
      content: { text: placement.text ?? "" },
    });
    itemIds.push(item.id);
  }

  const IMAGE_TIMEOUT_MS = 12_000;

  let images = 0;
  for (const placement of imagePlacements) {
    const prompt = placement.prompt?.trim();
    if (!prompt) continue;

    if (ctx.enableImage === false) {
      const item = await createMoodItem(ctx.client, ctx.moodboardId, {
        type: MoodItemType.TEXT,
        x: placement.x,
        y: placement.y,
        width: placement.width,
        height: placement.height,
        content: { text: `Visual: ${prompt}` },
      });
      itemIds.push(item.id);
      continue;
    }

    try {
      const styleForSlot = concept.imageStyles?.[images] as FashionImageStyle | undefined;
      const resolvedStyle = styleForSlot ?? inferImageStyle(prompt);
      const styledPrompt = buildFashionImagePrompt(prompt, resolvedStyle, {
        season: concept.season,
        palette: concept.colorNames ?? concept.palette,
      });
      // Per-image timeout: if FLUX takes >12s, fall through to placeholder
      const item = await Promise.race([
        createImageItem(ctx, styledPrompt, placement.x, placement.y, placement.width, placement.height),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Image generation timed out after 12s")), IMAGE_TIMEOUT_MS),
        ),
      ]);
      itemIds.push(item.id);
      images += 1;
    } catch (error) {
      console.error("Moodboard image slot failed:", error);
      const item = await createMoodItem(ctx.client, ctx.moodboardId, {
        type: MoodItemType.TEXT,
        x: placement.x,
        y: placement.y,
        width: placement.width,
        height: placement.height,
        content: { text: `Visual: ${prompt}` },
      });
      itemIds.push(item.id);
    }

    // Pace image generation to avoid bursting Fireworks AI rate limits.
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  return { layout, created: itemIds.length, images, itemIds };
}
