'use client';
import { useEffect } from 'react';
import { useEditor } from 'tldraw';
import {
  moodboardSyncState,
  shapeIdToMoodItemId,
} from '@/lib/canvas/tldraw-moodboard-utils';
import { useCanvasStore } from '@/lib/canvas/canvas-store';
import { useMoodItemsSync } from '@/hooks/use-mood-items-sync';

export function TldrawBridge({ moodboardId }: { moodboardId: string }) {
  const editor = useEditor();
  const setViewport = useCanvasStore((s) => s.setViewport);
  const selectItems = useCanvasStore((s) => s.selectItems);
  const { queueUpdate, cancelPending } = useMoodItemsSync(moodboardId);

  useEffect(() => {
    if (!editor) return;

    const syncCameraAndSelection = () => {
      const { x, y, z } = editor.getCamera();
      setViewport({ x, y, zoom: z });
      const moodItemIds = editor
        .getSelectedShapeIds()
        .map(shapeIdToMoodItemId)
        .filter((id): id is string => Boolean(id));
      selectItems(moodItemIds);
    };

    syncCameraAndSelection();

    const unlisten = editor.store.listen(
      (entry) => {
        syncCameraAndSelection();
        if (moodboardSyncState.active) return;
        const updated = entry.changes.updated;
        if (!updated) return;
        for (const [, [, after]] of Object.entries(updated)) {
          if (!after || after.typeName !== 'shape') continue;
          const itemId = shapeIdToMoodItemId(after.id);
          if (!itemId) continue;
          const props = after.props as { w?: number; h?: number };
          queueUpdate(itemId, {
            x: after.x,
            y: after.y,
            width: props.w ?? 200,
            height: props.h ?? 200,
          });
        }
      },
      { source: 'user' },
    );

    return () => {
      unlisten();
      cancelPending();
    };
  }, [editor, queueUpdate, cancelPending, selectItems, setViewport]);

  return null;
}
