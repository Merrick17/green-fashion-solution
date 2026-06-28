// Editorial moodboard layout — scrapbook grid with vertical title rail.

import { z } from "zod";
import { planScrapbookEditorialLayout } from "./editorial-scrapbook-layout";

export const conceptSchema = z.object({
  theme: z.string().describe("One-line creative theme e.g. 'Washed Linen Minimalism SS26'"),
  mood: z.string().describe("2-3 word mood e.g. 'refined, organic, understated'"),
  palette: z
    .array(z.string()).min(2).max(7)
    .describe("Hex color codes for the palette strip e.g. ['#F5D6E0', '#A8D4E6']"),
  colorNames: z
    .array(z.string()).optional()
    .describe("Human color names matching palette order e.g. ['ivory', 'warm sand', 'slate']"),
  styleKeywords: z
    .array(z.string()).min(1)
    .describe("Fashion style keywords e.g. ['minimalist', 'fluid', 'artisanal', 'SS26']"),
  layoutSuggestion: z
    .string()
    .describe("Canvas layout: editorial-grid · collage · fashion · circular · asymmetrical"),
  imagePrompts: z
    .array(z.string())
    .describe("8–10 image-generation prompts — be specific: style type, subject, lighting, season"),
  imageStyles: z
    .array(z.enum([
      "editorial-lookbook", "fabric-closeup", "technical-flat",
      "silhouette-sketch", "color-story", "runway-mood",
    ])).optional()
    .describe("Style type for each imagePrompt (same order) — drives structured prompt generation"),
  season: z.string().optional().describe("Target season e.g. 'SS26', 'AW26', 'Resort 2026'"),
  garmentCategories: z
    .array(z.string()).optional()
    .describe("Garment categories this direction applies to e.g. ['outerwear', 'tops']"),
  fabricDirections: z
    .array(z.string()).optional()
    .describe("Key fabric types e.g. ['washed linen', 'silk organza', 'brushed mohair']"),
});
export type Concept = z.infer<typeof conceptSchema>;

const FALLBACK_PALETTE = ["#F5F5F5", "#959595", "#333333"];

function coerceStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function toHexPalette(colors: string[]): string[] {
  const hexes = colors.filter((c) =>
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(c.trim()),
  );
  return hexes.length >= 2 ? hexes.slice(0, 7) : FALLBACK_PALETTE;
}

/**
 * Models often pass moodboardMetadata or partial objects to generateTldrawMoodboard.
 * Coerce those into the concept shape expected by the layout engine.
 */
export function normalizeConceptInput(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;

  const input = raw as Record<string, unknown>;

  if (
    typeof input.theme === "string" &&
    typeof input.mood === "string" &&
    Array.isArray(input.palette) &&
    Array.isArray(input.styleKeywords) &&
    typeof input.layoutSuggestion === "string" &&
    Array.isArray(input.imagePrompts)
  ) {
    return input;
  }

  const nested =
    (input.concept as Record<string, unknown> | undefined) ??
    (input.moodboardMetadata as Record<string, unknown> | undefined) ??
    (input.metadata as Record<string, unknown> | undefined);

  const src: Record<string, unknown> = nested ? { ...nested, ...input } : input;

  const theme = String(src.theme ?? src.styleDirection ?? "Collection direction").trim();
  const mood = String(src.mood ?? "Refined and contemporary").trim();
  const palette = toHexPalette(coerceStringArray(src.palette ?? src.colorPalette));

  const keywordSource = coerceStringArray(src.styleKeywords ?? src.fabricSuggestions);
  const styleKeywords =
    keywordSource.length > 0
      ? keywordSource.slice(0, 8)
      : theme
          .split(/[\s,·]+/)
          .map((w) => w.toLowerCase())
          .filter((w) => w.length > 2)
          .slice(0, 5);

  const imagePrompts = coerceStringArray(src.imagePrompts);
  const fabricHint = keywordSource[0] ?? "natural textures";
  const defaultPrompts = [
    `${theme}, ${mood}, product still life on split-tone pastel background, overhead flat lay`,
    `Texture close-up, ${fabricHint}, soft bubbles or water surface, ${mood} palette`,
    `Abstract fabric or material texture, ${theme}, ${mood}, macro photography`,
    `Architectural or environmental reference, ${mood}, clean lines, tonal harmony`,
    `Minimal line illustration or sketch, ${theme}, fashion detail, black ink on white`,
    `Crystalline or glittery surface texture, ${fabricHint}, ${mood}, square crop`,
    `${theme}, ${mood}, luxury fashion editorial lookbook portrait, full body, hero shot`,
    `Graphic color-block composition, palm shadow or organic pattern, ${mood}, diagonal split tones`,
    `Still life accent objects, ${fabricHint}, ${mood}, soft studio light, square crop`,
    `Floral or botanical macro detail, ${theme}, ${mood}, pastel tones, square crop`,
  ];

  return {
    theme,
    mood,
    palette,
    colorNames: coerceStringArray(src.colorNames ?? []),
    styleKeywords: styleKeywords.length > 0 ? styleKeywords : ["minimalist", "editorial"],
    layoutSuggestion: String(src.layoutSuggestion ?? "editorial-grid"),
    imagePrompts: imagePrompts.length >= 2 ? imagePrompts.slice(0, 10) : defaultPrompts,
    imageStyles: coerceStringArray(src.imageStyles ?? []),
    season: src.season ? String(src.season) : undefined,
    garmentCategories: coerceStringArray(src.garmentCategories ?? []),
    fabricDirections: coerceStringArray(src.fabricDirections ?? []),
  };
}

/** Lenient input for generateTldrawMoodboard — accepts concept OR moodboardMetadata. */
export const buildMoodboardInputSchema = z.preprocess(normalizeConceptInput, conceptSchema);

export type PlacementKind = "image" | "swatch" | "text";

export interface Placement {
  kind: PlacementKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  prompt?: string;
  hex?: string;
  text?: string;
}

export type ConceptLayout = "editorial" | "collage" | "freeform" | "circular";

/** Clear left rail for tldraw toolbars */
const TOOLBAR_INSET = 32;
const MARGIN = 48 + TOOLBAR_INSET;
const GAP = 20;
const CANVAS_W = 1280;

function resolveLayout(raw: string): ConceptLayout {
  const s = raw.toLowerCase();
  if (s.includes("circular")) return "circular";
  if (s.includes("pinterest") || s.includes("freeform") || s.includes("free")) {
    return "freeform";
  }
  if (s.includes("collage") || s.includes("asymmetr")) return "collage";
  return "editorial";
}

function placeCircularImages(prompts: string[], baseY: number): Placement[] {
  const cx = MARGIN + 520;
  const cy = baseY + 280;
  const radius = 260;
  const size = 200;
  return prompts.map((prompt, i) => {
    const angle = (i / Math.max(prompts.length, 1)) * Math.PI * 2 - Math.PI / 2;
    return {
      kind: "image" as const,
      prompt,
      x: cx + Math.cos(angle) * radius - size / 2,
      y: cy + Math.sin(angle) * radius - size / 2,
      width: size,
      height: size,
    };
  });
}

function placeFreeformImages(prompts: string[], baseY: number): Placement[] {
  const sizes = [
    { w: 280, h: 360 },
    { w: 220, h: 280 },
    { w: 200, h: 240 },
    { w: 260, h: 200 },
    { w: 180, h: 220 },
    { w: 240, h: 300 },
  ];
  let x = MARGIN;
  let y = baseY;
  let rowH = 0;
  return prompts.map((prompt, i) => {
    const size = sizes[i % sizes.length]!;
    if (x + size.w > CANVAS_W - 48) {
      x = MARGIN;
      y += rowH + GAP;
      rowH = 0;
    }
    const placement: Placement = {
      kind: "image",
      prompt,
      x,
      y,
      width: size.w,
      height: size.h,
    };
    x += size.w + GAP;
    rowH = Math.max(rowH, size.h);
    return placement;
  });
}

export function planConceptLayout(concept: Concept): {
  layout: ConceptLayout;
  placements: Placement[];
} {
  const layout = resolveLayout(concept.layoutSuggestion);

  if (layout === "editorial" || layout === "collage") {
    return { layout, placements: planScrapbookEditorialLayout(concept) };
  }

  const placements: Placement[] = [];
  const prompts = concept.imagePrompts.slice(0, 10);
  const imagesStartY = MARGIN + 120;

  switch (layout) {
    case "circular":
      placements.push(...placeCircularImages(prompts, imagesStartY));
      break;
    default:
      placements.push(...placeFreeformImages(prompts, imagesStartY));
      break;
  }

  return { layout, placements };
}
