// Fashion-specific image prompt builder.
// Structures prompts for Fireworks AI image generation with editorial context.

export type FashionImageStyle =
  | "editorial-lookbook"  // model or garment, natural/studio light, fashion story
  | "fabric-closeup"      // texture macro, surface detail, white or neutral background
  | "technical-flat"      // flat lay technical drawing, clean lines, white background
  | "silhouette-sketch"   // pencil fashion illustration, minimal linework
  | "color-story"         // curated flatlay of objects, swatches, and textiles
  | "runway-mood";        // showroom/runway atmosphere, architectural space

const STYLE_PREFIX: Record<FashionImageStyle, string> = {
  "editorial-lookbook":
    "editorial fashion photography, studio natural light, neutral background,",
  "fabric-closeup":
    "macro fabric texture photography, high detail surface, white background,",
  "technical-flat":
    "fashion technical flat lay drawing, precise clean lines, white background, minimal,",
  "silhouette-sketch":
    "fashion illustration, pencil sketch, clean minimal linework, white background,",
  "color-story":
    "fashion color story flatlay, curated textile and object arrangement, soft light,",
  "runway-mood":
    "luxury fashion showroom atmosphere, architectural minimal space, mood lighting,",
};

/**
 * Build a structured prompt for fashion image generation.
 * The result is more specific than free-text and produces consistent editorial output.
 */
export function buildFashionImagePrompt(
  description: string,
  style: FashionImageStyle = "editorial-lookbook",
  options: {
    season?: string;
    palette?: string[];
    aesthetic?: string;
  } = {},
): string {
  const seasonTag = options.season ? `, ${options.season} collection` : "";
  const paletteTag =
    options.palette && options.palette.length > 0
      ? `, ${options.palette.slice(0, 3).join(", ")} palette`
      : "";
  const aestheticTag = options.aesthetic ? `, ${options.aesthetic}` : "";

  return [
    STYLE_PREFIX[style],
    description,
    seasonTag,
    paletteTag,
    aestheticTag,
    ", luxury fashion sourcing reference",
  ]
    .filter(Boolean)
    .join("")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Infer the best image style from an image prompt description. */
export function inferImageStyle(prompt: string): FashionImageStyle {
  const p = prompt.toLowerCase();
  if (p.includes("texture") || p.includes("closeup") || p.includes("close-up") || p.includes("fabric detail"))
    return "fabric-closeup";
  if (p.includes("flat") || p.includes("technical") || p.includes("sketch") || p.includes("illustration"))
    return "technical-flat";
  if (p.includes("silhouette") || p.includes("illustration") || p.includes("drawing"))
    return "silhouette-sketch";
  if (p.includes("color story") || p.includes("palette") || p.includes("swatch") || p.includes("flatlay"))
    return "color-story";
  if (p.includes("runway") || p.includes("showroom") || p.includes("catwalk"))
    return "runway-mood";
  return "editorial-lookbook";
}
