// Scrapbook editorial moodboard — vertical title rail, top image strip, hero + quote,
// palette row, and accent tiles. Matches Pinterest-style fashion moodboard spreads.

import type { Concept, Placement } from "./concept-layout";

const TOOLBAR_INSET = 32;
const MARGIN = 48 + TOOLBAR_INSET;
const GAP = 12;
const CANVAS_W = 1280;
const TITLE_RAIL = 56;
const CONTENT_X = MARGIN + TITLE_RAIL + GAP;
const CONTENT_W = CANVAS_W - CONTENT_X - 48;
const SWATCH = 48;

function topRowSlots(y: number): Array<{ x: number; y: number; width: number; height: number }> {
  const rowH = 196;
  const colW = Math.floor((CONTENT_W - GAP * 4) / 5);
  return Array.from({ length: 5 }, (_, i) => ({
    x: CONTENT_X + i * (colW + GAP),
    y,
    width: colW,
    height: rowH,
  }));
}

function middleRowSlots(topY: number) {
  const y = topY;
  const leftW = Math.floor(CONTENT_W * 0.19);
  const heroW = Math.floor(CONTENT_W * 0.46);
  const rightW = CONTENT_W - leftW - heroW - GAP * 2;
  const rowH = 276;

  const leftX = CONTENT_X;
  const heroX = leftX + leftW + GAP;
  const rightX = heroX + heroW + GAP;

  return {
    left: { x: leftX, y, width: leftW, height: leftW },
    hero: { x: heroX, y, width: heroW, height: rowH },
    right: { x: rightX, y, width: rightW, height: Math.floor(rowH * 0.72) },
    heroX,
    heroW,
    rowBottom: y + rowH,
  };
}

function bottomAccentSlots(middle: ReturnType<typeof middleRowSlots>, paletteBottom: number) {
  const size = Math.floor(middle.right.width / 2 - GAP / 2);
  const y = paletteBottom + GAP + 8;
  return [
    { x: middle.right.x, y, width: size, height: size },
    { x: middle.right.x + size + GAP, y, width: size, height: size },
  ];
}

export function planScrapbookEditorialLayout(concept: Concept): Placement[] {
  const placements: Placement[] = [];
  const prompts = concept.imagePrompts.slice(0, 10);

  placements.push({
    kind: "text",
    text: concept.theme.toUpperCase(),
    x: MARGIN + 8,
    y: 300,
    width: 40,
    height: 440,
    rotation: -90,
  });

  const topY = MARGIN;
  const topSlots = topRowSlots(topY);
  topSlots.forEach((slot, i) => {
    const prompt = prompts[i];
    if (prompt) placements.push({ kind: "image", prompt, ...slot });
  });

  const middle = middleRowSlots(topY + topSlots[0]!.height + GAP);
  const middlePrompts = [prompts[5], prompts[6], prompts[7]].filter(Boolean) as string[];
  const middleSlots = [middle.left, middle.hero, middle.right];
  middlePrompts.forEach((prompt, i) => {
    const slot = middleSlots[i];
    if (slot) placements.push({ kind: "image", prompt, ...slot });
  });

  const quoteY = middle.rowBottom + GAP;
  const tagline = [concept.mood, ...concept.styleKeywords.slice(0, 3)]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();
  placements.push({
    kind: "text",
    text: tagline,
    x: middle.heroX,
    y: quoteY,
    width: middle.heroW,
    height: 36,
  });

  const paletteY = quoteY + 36 + GAP;
  const palette = concept.palette.slice(0, 7);
  const paletteTotalW = palette.length * SWATCH + (palette.length - 1) * 8;
  let swatchX = middle.heroX + Math.max(0, Math.floor((middle.heroW - paletteTotalW) / 2));

  for (let si = 0; si < palette.length; si++) {
    const hex = palette[si]!;
    placements.push({
      kind: "swatch",
      hex,
      x: swatchX,
      y: paletteY,
      width: SWATCH,
      height: SWATCH,
    });
    const colorName = concept.colorNames?.[si];
    if (colorName) {
      placements.push({
        kind: "text",
        text: colorName,
        x: swatchX,
        y: paletteY + SWATCH + 4,
        width: SWATCH + 12,
        height: 22,
      });
    }
    swatchX += SWATCH + 8;
  }

  const paletteBottom = paletteY + SWATCH + (concept.colorNames?.length ? 28 : 0);
  const accentSlots = bottomAccentSlots(middle, paletteBottom);
  const accentPrompts = [prompts[8], prompts[9]].filter(Boolean) as string[];
  accentPrompts.forEach((prompt, i) => {
    const slot = accentSlots[i];
    if (slot) placements.push({ kind: "image", prompt, ...slot });
  });

  if (concept.fabricDirections?.length) {
    placements.push({
      kind: "text",
      text: concept.fabricDirections.slice(0, 4).join("  ·  "),
      x: CONTENT_X,
      y: paletteBottom + GAP + 8,
      width: middle.left.width + GAP + middle.heroW,
      height: 28,
    });
  }

  return placements;
}
