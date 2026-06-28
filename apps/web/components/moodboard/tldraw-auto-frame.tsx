'use client';
import { useEffect, useRef } from 'react';
import { useEditor } from 'tldraw';
import { useCanvasStore } from '@/lib/canvas/canvas-store';

/**
 * Reframes the tldraw camera to fit all shapes after each moodboard AI agent
 * turn. Agent-created/changed shapes frequently land outside the current
 * viewport; without reframing the user sees "nothing changed".
 *
 * The reframe is debounced so the authoritative finish-time refetch
 * (see useMoodboardAi) and the subsequent TldrawSync reconcile settle first.
 */
const REFRAME_DELAY_MS = 500;

export function TldrawAutoFrame() {
  const editor = useEditor();
  const aiTurnCounter = useCanvasStore((s) => s.aiTurnCounter);
  const lastFramed = useRef(0);

  useEffect(() => {
    if (!editor) return;
    if (aiTurnCounter <= lastFramed.current) return;
    lastFramed.current = aiTurnCounter;

    const timer = setTimeout(() => {
      if (editor.getCurrentPageShapeIds().size === 0) return;
      editor.zoomToFit({ animation: { duration: 400 } });
    }, REFRAME_DELAY_MS);

    return () => clearTimeout(timer);
  }, [editor, aiTurnCounter]);

  return null;
}