'use client';

import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { moodItemsApi } from '@/lib/api/mood-items.api';
import { queryKeys } from '@/lib/query-keys';

const PERSIST_DEBOUNCE_MS = 400;

export type MoodItemGeometryPatch = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function useMoodItemsSync(moodboardId: string) {
  const qc = useQueryClient();
  const pendingUpdates = useRef<Map<string, MoodItemGeometryPatch>>(new Map());
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushPending = useCallback(() => {
    const updates = new Map(pendingUpdates.current);
    pendingUpdates.current.clear();
    if (updates.size === 0) return;

    void Promise.all(
      [...updates.entries()].map(([id, patch]) =>
        moodItemsApi.update(moodboardId, id, patch),
      ),
    ).then(() => {
      qc.invalidateQueries({
        queryKey: queryKeys.moodboards.full(moodboardId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.moodItems.byMoodboard(moodboardId),
      });
    });
  }, [moodboardId, qc]);

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(flushPending, PERSIST_DEBOUNCE_MS);
  }, [flushPending]);

  const queueUpdate = useCallback(
    (id: string, patch: MoodItemGeometryPatch) => {
      pendingUpdates.current.set(id, patch);
      scheduleFlush();
    },
    [scheduleFlush],
  );

  const cancelPending = useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
  }, []);

  return { queueUpdate, flushPending, cancelPending };
}
