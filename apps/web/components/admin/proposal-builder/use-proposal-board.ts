'use client';

import { useCallback, useState } from 'react';
import type { AssetKind, BoardSection } from './board-state';
import {
  insertItemPure,
  reindexItems,
  reorderItemsPure,
  uid,
} from './board-state';

export function useProposalBoard(initial: BoardSection[]) {
  const [sections, setSections] = useState<BoardSection[]>(initial);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    initial[0]?.id ?? '',
  );

  const reset = useCallback((next: BoardSection[]) => {
    setSections(next);
    setActiveSectionId(next[0]?.id ?? '');
  }, []);

  const addSection = useCallback(() => {
    const id = uid('sec');
    setSections((prev) => [
      ...prev,
      {
        id,
        isNew: true,
        title: `Section ${prev.length + 1}`,
        position: prev.length,
        items: [],
      },
    ]);
    setActiveSectionId(id);
  }, []);

  const renameSection = useCallback((id: string, title: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
  }, []);

  const removeSection = useCallback((id: string) => {
    setSections((prev) => {
      if (prev.length <= 1) return prev;
      return prev
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, position: i }));
    });
    setActiveSectionId((cur) => (cur === id ? '' : cur));
  }, []);

  const reorderSections = useCallback((activeId: string, overId: string) => {
    if (activeId === overId) return;
    setSections((prev) => {
      const sorted = [...prev].sort((a, b) => a.position - b.position);
      const from = sorted.findIndex((s) => s.id === activeId);
      const to = sorted.findIndex((s) => s.id === overId);
      if (from < 0 || to < 0) return prev;
      const [moved] = sorted.splice(from, 1);
      if (!moved) return prev;
      sorted.splice(to, 0, moved);
      return sorted.map((s, i) => ({ ...s, position: i }));
    });
  }, []);

  const addItem = useCallback(
    (assetId: string, kind: AssetKind) => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== activeSectionId) return s;
          if (s.items.some((it) => it.kind === kind && it.assetId === assetId))
            return s;
          return {
            ...s,
            items: [
              ...s.items,
              {
                key: uid('it'),
                kind,
                assetId,
                notes: '',
                position: s.items.length,
              },
            ],
          };
        }),
      );
    },
    [activeSectionId],
  );

  const removeItem = useCallback((sectionId: string, itemKey: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              items: reindexItems(s.items.filter((it) => it.key !== itemKey)),
            },
      ),
    );
  }, []);

  const reorderItems = useCallback(
    (sectionId: string, activeKey: string, overKey: string) => {
      if (activeKey === overKey) return;
      setSections((prev) =>
        prev.map((s) =>
          s.id !== sectionId
            ? s
            : { ...s, items: reorderItemsPure(s.items, activeKey, overKey) },
        ),
      );
    },
    [],
  );

  const moveItem = useCallback(
    (
      fromSectionId: string,
      toSectionId: string,
      itemKey: string,
      overKey: string | null,
    ) => {
      if (fromSectionId === toSectionId) return;
      setSections((prev) => {
        const from = prev.find((s) => s.id === fromSectionId);
        const moved = from?.items.find((it) => it.key === itemKey);
        if (!from || !moved) return prev;
        return prev.map((s) => {
          if (s.id === fromSectionId) {
            return {
              ...s,
              items: reindexItems(s.items.filter((it) => it.key !== itemKey)),
            };
          }
          if (s.id === toSectionId)
            return { ...s, items: insertItemPure(s.items, moved, overKey) };
          return s;
        });
      });
    },
    [],
  );

  const updateItemNotes = useCallback(
    (sectionId: string, itemKey: string, notes: string) => {
      setSections((prev) =>
        prev.map((s) =>
          s.id !== sectionId
            ? s
            : {
                ...s,
                items: s.items.map((it) =>
                  it.key === itemKey ? { ...it, notes } : it,
                ),
              },
        ),
      );
    },
    [],
  );

  const updateSectionAdminNotes = useCallback(
    (sectionId: string, adminNotes: string) => {
      setSections((prev) =>
        prev.map((s) => (s.id !== sectionId ? s : { ...s, adminNotes })),
      );
    },
    [],
  );

  return {
    sections,
    activeSectionId,
    setActiveSection: setActiveSectionId,
    reset,
    addSection,
    renameSection,
    removeSection,
    reorderSections,
    addItem,
    removeItem,
    reorderItems,
    moveItem,
    updateItemNotes,
    updateSectionAdminNotes,
  };
}

export type UseProposalBoard = ReturnType<typeof useProposalBoard>;
