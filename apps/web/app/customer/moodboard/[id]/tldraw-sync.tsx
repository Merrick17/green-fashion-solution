'use client';
import { useEffect, useRef, useState } from 'react';
import { useEditor } from 'tldraw';
import type { MoodItem, TextContent, LinkContent } from '@repo/types';
import { resolveStorageKey } from '@/lib/storage/upload-file';
import {
  moodboardSyncState,
  moodItemShapeId,
  toRichText,
} from '@/lib/canvas/tldraw-moodboard-utils';
import {
  clearAssetId,
  getImageSrc,
  hexToTldrawColor,
  itemStateKey,
  syncImageShape,
  toShapeRotation,
} from './tldraw-helpers';
export function TldrawSync({ items }: { items: MoodItem[] }) {
  const editor = useEditor();
  const processedItems = useRef<Map<string, string>>(new Map());
  const resolvedUrlsRef = useRef<Record<string, string>>({});
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    const keysToResolve = items.filter((item) => {
      const c = item.content as { key?: string; src?: string };
      return (
        c.key &&
        !c.src?.startsWith('http') &&
        !c.src?.startsWith('data:') &&
        !resolvedUrlsRef.current[item.id]
      );
    });
    if (keysToResolve.length === 0) return;
    void Promise.all(
      keysToResolve.map(async (item) => {
        const key = (item.content as { key: string }).key;
        try {
          const url = await resolveStorageKey(key);
          return [item.id, url] as const;
        } catch {
          return [item.id, ''] as const;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setResolvedUrls((prev) => {
        const next = { ...prev };
        for (const [id, url] of entries) {
          if (!url) continue;
          next[id] = url;
          resolvedUrlsRef.current[id] = url;
        }
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [items]);
  useEffect(() => {
    if (!editor) return;
    moodboardSyncState.active = true;
    try {
      items.forEach((item) => {
        const shapeId = moodItemShapeId(item.id);
        const x = item.x ?? 0;
        const y = item.y ?? 0;
        const w = item.width ?? 200;
        const h = item.height ?? 200;
        const rotation = toShapeRotation(item.rotation);
        const stateKey = itemStateKey(item, resolvedUrls);
        if (processedItems.current.get(item.id) === stateKey) return;
        processedItems.current.set(item.id, stateKey);
        const existingShape = editor.getShape(shapeId);
        switch (item.type) {
          case 'TEXT': {
            const text = String(
              (item.content as TextContent)?.text || 'New Text',
            );
            const props = {
              richText: toRichText(text),
              color: 'black' as const,
              w: Math.max(w, 120),
              autoSize: Math.abs(item.rotation ?? 0) < 1,
            };
            if (existingShape?.type === 'text') {
              editor.updateShape({ id: shapeId, type: 'text', x, y, rotation, props });
            } else {
              if (existingShape) editor.deleteShape(shapeId);
              editor.createShape({ id: shapeId, type: 'text', x, y, rotation, props });
            }
            break;
          }
          case 'COLOR': {
            const hex = String(
              (item.content as { hex?: string })?.hex || '#000000',
            );
            const color = hexToTldrawColor(hex);
            const geoProps = { geo: 'rectangle' as const, w, h, fill: 'solid' as const, color, dash: 'solid' as const, size: 's' as const };
            if (existingShape?.type === 'geo') {
              editor.updateShape({ id: shapeId, type: 'geo', x, y, rotation, props: geoProps });
            } else {
              if (existingShape) editor.deleteShape(shapeId);
              editor.createShape({ id: shapeId, type: 'geo', x, y, rotation, props: geoProps });
            }
            break;
          }
          case 'LINK': {
            const link = item.content as LinkContent;
            const props = { url: link.url, w, h };
            if (existingShape?.type === 'embed') {
              editor.updateShape({ id: shapeId, type: 'embed', x, y, rotation, props });
            } else {
              if (existingShape) editor.deleteShape(shapeId);
              editor.createShape({ id: shapeId, type: 'embed', x, y, rotation, props });
            }
            break;
          }
          case 'IMAGE':
          case 'AI_GENERATED': {
            const content = item.content as {
              src?: string;
              alt?: string;
              prompt?: string;
            };
            const alt = content.alt || content.prompt || 'Image';
            const src = getImageSrc(item, resolvedUrls);
            if (src) {
              syncImageShape(editor, item, x, y, w, h, src, alt);
            } else if (!existingShape) {
              editor.createShape({
                id: shapeId,
                type: 'geo',
                x,
                y,
                rotation,
                props: {
                  geo: 'rectangle',
                  w,
                  h,
                  fill: 'pattern',
                  color: 'light-blue',
                  richText: toRichText(content.prompt || alt || 'Image loading…'),
                },
              });
            }
            break;
          }
          default:
            break;
        }
      });
      for (const processedId of processedItems.current.keys()) {
        if (!items.find((item) => item.id === processedId)) {
          const shapeId = moodItemShapeId(processedId);
          if (editor.getShape(shapeId)) editor.deleteShape(shapeId);
          clearAssetId(processedId);
          processedItems.current.delete(processedId);
        }
      }
      if (items.length === 0 && processedItems.current.size > 0) {
        for (const processedId of [...processedItems.current.keys()]) {
          const shapeId = moodItemShapeId(processedId);
          if (editor.getShape(shapeId)) editor.deleteShape(shapeId);
          clearAssetId(processedId);
          processedItems.current.delete(processedId);
        }
      }
    } finally {
      moodboardSyncState.active = false;
    }
  }, [editor, items, resolvedUrls]);
  return null;
}
