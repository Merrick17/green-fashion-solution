import type { MoodItem } from "@repo/types";

type LayoutItem = Pick<MoodItem, "id" | "x" | "y" | "width" | "height" | "type">;

const GAP = 20;
const COLS = 4;
const CANVAS_W = 1280;
const MARGIN = 40;

// Fashion editorial: portrait images dominate, text and swatches anchor corners.
// Mimics a spread layout — large hero left, supporting images right, captions below.
export function computeFashionLayout(items: LayoutItem[]): Array<{ id: string; x: number; y: number; width: number; height: number }> {
  const images = items.filter((i) => i.type === "IMAGE" || i.type === "AI_GENERATED");
  const swatches = items.filter((i) => i.type === "COLOR");
  const texts = items.filter((i) => i.type === "TEXT" || i.type === "LINK");

  const updates: Array<{ id: string; x: number; y: number; width: number; height: number }> = [];

  // Hero image — large portrait left column
  const heroW = 360;
  const heroH = 480;
  if (images[0]) {
    updates.push({ id: images[0].id, x: MARGIN, y: MARGIN, width: heroW, height: heroH });
  }

  // Secondary images — right of hero, stacked portrait
  const secW = 240;
  const secH = 300;
  let secX = MARGIN + heroW + GAP;
  let secY = MARGIN;
  for (let i = 1; i < Math.min(images.length, 4); i++) {
    updates.push({ id: images[i]!.id, x: secX, y: secY, width: secW, height: secH });
    secX += secW + GAP;
    if (secX + secW > CANVAS_W - MARGIN) {
      secX = MARGIN + heroW + GAP;
      secY += secH + GAP;
    }
  }

  // Remaining images — below hero in a masonry row
  let rowX = MARGIN;
  const rowY = MARGIN + heroH + GAP;
  for (let i = 4; i < images.length; i++) {
    const w = 220;
    const h = 280;
    updates.push({ id: images[i]!.id, x: rowX, y: rowY, width: w, height: h });
    rowX += w + GAP;
  }

  // Color swatches — small row bottom-left
  let swX = MARGIN;
  const swY = MARGIN + heroH + GAP + (images.length > 4 ? 300 : 0);
  const swSize = 80;
  for (const swatch of swatches) {
    updates.push({ id: swatch.id, x: swX, y: swY, width: swSize, height: swSize });
    swX += swSize + GAP;
  }

  // Text notes — right of swatches or below images
  let txX = swX + (swatches.length > 0 ? GAP : 0);
  let txY = swY;
  for (const text of texts) {
    const w = 200;
    const h = 60;
    updates.push({ id: text.id, x: txX, y: txY, width: w, height: h });
    txX += w + GAP;
    if (txX + w > CANVAS_W - MARGIN) {
      txX = MARGIN;
      txY += h + GAP;
    }
  }

  return updates;
}

export function computeGridLayout(items: LayoutItem[]): Array<{ id: string; x: number; y: number }> {
  let cursorX = MARGIN;
  let cursorY = MARGIN;
  let rowHeight = 0;
  let col = 0;
  const updates: Array<{ id: string; x: number; y: number }> = [];

  for (const item of items) {
    updates.push({ id: item.id, x: cursorX, y: cursorY });
    rowHeight = Math.max(rowHeight, item.height);
    col += 1;
    if (col >= COLS) {
      col = 0;
      cursorX = MARGIN;
      cursorY += rowHeight + GAP;
      rowHeight = 0;
    } else {
      cursorX += item.width + GAP;
    }
  }

  return updates;
}

export function computeMasonryLayout(items: LayoutItem[]): Array<{ id: string; x: number; y: number }> {
  if (items.length === 0) return [];

  // Dynamic column width based on widest item; min 3 cols
  const maxItemWidth = Math.max(...items.map((i) => i.width), 160);
  const numCols = Math.max(3, Math.floor((CANVAS_W - MARGIN * 2) / (maxItemWidth + GAP)));
  const colWidth = Math.floor((CANVAS_W - MARGIN * 2 - GAP * (numCols - 1)) / numCols);

  const columnHeights = Array(numCols).fill(MARGIN) as number[];
  const columnX = Array.from({ length: numCols }, (_, i) => MARGIN + i * (colWidth + GAP));
  const updates: Array<{ id: string; x: number; y: number }> = [];

  items.forEach((item, index) => {
    const col = index % numCols;
    const x = columnX[col]!;
    const y = columnHeights[col]!;
    updates.push({ id: item.id, x, y });
    columnHeights[col] = y + item.height + GAP;
  });

  return updates;
}

export function computeCircularLayout(items: LayoutItem[]): Array<{ id: string; x: number; y: number }> {
  const cx = 400;
  const cy = 300;
  const radius = 220;
  const updates: Array<{ id: string; x: number; y: number }> = [];

  items.forEach((item, index) => {
    const angle = (index / Math.max(items.length, 1)) * Math.PI * 2;
    updates.push({
      id: item.id,
      x: cx + Math.cos(angle) * radius - item.width / 2,
      y: cy + Math.sin(angle) * radius - item.height / 2,
    });
  });

  return updates;
}

export function computeCollageLayout(items: LayoutItem[]): Array<{ id: string; x: number; y: number }> {
  // Scattered freeform: images large, text small, colors tiny — natural collage feel
  const imageSizes = [
    { w: 300, h: 360 },
    { w: 240, h: 300 },
    { w: 280, h: 240 },
    { w: 260, h: 320 },
    { w: 220, h: 280 },
  ];
  const updates: Array<{ id: string; x: number; y: number }> = [];
  let x = MARGIN;
  let y = MARGIN;
  let rowH = 0;
  let slotIndex = 0;

  for (const item of items) {
    let targetW: number;
    let targetH: number;

    if (item.type === "COLOR") {
      targetW = 64;
      targetH = 64;
    } else if (item.type === "TEXT") {
      targetW = 160;
      targetH = item.height;
    } else {
      const size = imageSizes[slotIndex % imageSizes.length]!;
      targetW = size.w;
      targetH = size.h;
      slotIndex++;
    }

    if (x + targetW > CANVAS_W - MARGIN) {
      x = MARGIN;
      y += rowH + GAP;
      rowH = 0;
    }

    updates.push({ id: item.id, x, y });
    x += targetW + GAP;
    rowH = Math.max(rowH, targetH);
  }

  return updates;
}

export type LayoutKind = "grid" | "masonry" | "circular" | "color-flow" | "collage" | "editorial-grid" | "fashion";

const layoutStrategies: Record<
  LayoutKind,
  (items: LayoutItem[]) => Array<{ id: string; x: number; y: number; width?: number; height?: number }>
> = {
  grid: computeGridLayout,
  masonry: computeMasonryLayout,
  circular: computeCircularLayout,
  "color-flow": (items) => computeGridLayout([...items].sort((a, b) => a.x - b.x)),
  collage: computeCollageLayout,
  // editorial-grid uses masonry with a bias toward images first
  "editorial-grid": (items) => {
    const images = items.filter((i) => i.type === "IMAGE" || i.type === "AI_GENERATED");
    const rest = items.filter((i) => i.type !== "IMAGE" && i.type !== "AI_GENERATED");
    return computeMasonryLayout([...images, ...rest]);
  },
  // fashion: portrait hero + supporting images + swatches + text captions (also resizes items)
  fashion: (items) => computeFashionLayout(items),
};

export function applyLayoutStrategy(
  items: LayoutItem[],
  layout: LayoutKind,
): Array<{ id: string; x: number; y: number; width?: number; height?: number }> {
  return layoutStrategies[layout](items);
}

export function analyzeBoardComposition(items: MoodItem[]) {
  const byType = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalItems: items.length,
    byType,
    hasColors: (byType.COLOR ?? 0) > 0,
    hasImages: (byType.IMAGE ?? 0) + (byType.AI_GENERATED ?? 0) > 0,
    hasText: (byType.TEXT ?? 0) > 0,
  };
}
