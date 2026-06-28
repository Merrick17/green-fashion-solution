'use client';
import { useEditor, AssetRecordType, type TLDefaultColorStyle } from 'tldraw';
import type { MoodItem } from '@repo/types';
import {
  clearAssetId,
  getImageSrc,
  getOrCreateAssetId,
  moodItemShapeId,
} from '@/lib/canvas/tldraw-moodboard-utils';

// Map an arbitrary hex color to the nearest tldraw color token.
// Tldraw geo shapes use a fixed palette; this gives the closest match so
// color swatches render as native editable shapes instead of image blobs.
export function hexToTldrawColor(hex: string): TLDefaultColorStyle {
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  if (brightness < 40) return 'black';
  if (brightness > 220) return 'white';

  // Hue-based mapping
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta < 20) {
    // Achromatic
    if (brightness < 100) return 'grey';
    return 'grey';
  }

  let hue = 0;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  if (hue < 20 || hue >= 345) return 'red';
  if (hue < 45) return 'orange';
  if (hue < 70) return 'yellow';
  if (hue < 150) return 'green';
  if (hue < 195) return 'light-blue';
  if (hue < 255) return 'blue';
  if (hue < 290) return 'violet';
  return 'light-violet';
}

export function itemStateKey(
  item: MoodItem,
  resolvedUrls: Record<string, string>,
): string {
  return JSON.stringify({
    x: item.x,
    y: item.y,
    w: item.width,
    h: item.height,
    r: item.rotation,
    type: item.type,
    content: item.content,
    src: getImageSrc(item, resolvedUrls),
  });
}

export function toShapeRotation(degrees: number | undefined): number {
  return ((degrees ?? 0) * Math.PI) / 180;
}

export function syncImageShape(
  editor: ReturnType<typeof useEditor>,
  item: MoodItem,
  x: number,
  y: number,
  w: number,
  h: number,
  src: string,
  alt: string,
) {
  const shapeId = moodItemShapeId(item.id);
  const rotation = toShapeRotation(item.rotation);
  const assetId = getOrCreateAssetId(item.id);
  const asset = AssetRecordType.create({
    id: assetId,
    type: 'image',
    props: { name: alt, src, w, h, mimeType: 'image/png', isAnimated: false },
  });
  const existingAsset = editor.getAsset(assetId);
  if (existingAsset?.type === 'image') {
    editor.updateAssets([
      {
        ...existingAsset,
        props: { ...existingAsset.props, src, w, h, name: alt },
      },
    ]);
  } else {
    editor.createAssets([asset]);
  }
  const existing = editor.getShape(shapeId);
  if (existing?.type === 'image') {
    editor.updateShape({
      id: shapeId,
      type: 'image',
      x,
      y,
      rotation,
      props: { w, h, assetId },
    });
  } else {
    if (existing) editor.deleteShape(shapeId);
    editor.createShape({
      id: shapeId,
      type: 'image',
      x,
      y,
      rotation,
      props: { w, h, assetId },
    });
  }
}

export { clearAssetId, getImageSrc };
