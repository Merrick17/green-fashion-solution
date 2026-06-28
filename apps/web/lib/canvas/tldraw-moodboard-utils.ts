"use client";

import {
  AssetRecordType,
  createShapeId,
  renderPlaintextFromRichText,
  toRichText,
  type Editor,
  type TLAssetId,
  type TLShapeId,
} from "tldraw";

/** Client-only tldraw canvas helpers. Do not import from API routes or server code. */

export const moodboardSyncState = { active: false };

export function moodItemShapeId(itemId: string): TLShapeId {
  return createShapeId(itemId);
}

export { shapeIdToMoodItemId } from "./moodboard-item-utils";

export function createSolidColorDataUrl(hex: string, w: number, h: number): string {
  if (typeof document === "undefined") {
    return `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${hex}"/></svg>`,
    )}`;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  return canvas.toDataURL("image/png");
}

export { getImageSrc } from "./moodboard-item-utils";

export function readShapeText(editor: Editor, shape: { type: string; props: Record<string, unknown> }): string {
  const richText = shape.props.richText;
  if (richText && typeof richText === "object") {
    return renderPlaintextFromRichText(editor, richText as Parameters<typeof renderPlaintextFromRichText>[1]);
  }
  return "";
}

const assetIdByItem = new Map<string, TLAssetId>();

export function getOrCreateAssetId(itemId: string): TLAssetId {
  const existing = assetIdByItem.get(itemId);
  if (existing) return existing;
  const id = AssetRecordType.createId();
  assetIdByItem.set(itemId, id);
  return id;
}

export function clearAssetId(itemId: string): void {
  assetIdByItem.delete(itemId);
}

export { toRichText };
