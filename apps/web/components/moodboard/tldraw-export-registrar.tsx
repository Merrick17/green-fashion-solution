'use client';

import { useEffect } from 'react';
import { useEditor } from 'tldraw';
import { useCanvasStore } from '@/lib/canvas/canvas-store';
import type { MoodboardExportFormat } from '@/lib/canvas/moodboard-export.types';

interface TldrawExportRegistrarProps {
  fileName: string;
}

export function TldrawExportRegistrar({ fileName }: TldrawExportRegistrarProps) {
  const editor = useEditor();
  const setExportCanvas = useCanvasStore((s) => s.setExportCanvas);

  useEffect(() => {
    if (!editor) return;

    const exportCanvas = async (format: MoodboardExportFormat) => {
      const { exportMoodboardCanvas } = await import('@/lib/canvas/moodboard-export');
      await exportMoodboardCanvas(editor, format, fileName);
    };

    setExportCanvas(exportCanvas);
    return () => setExportCanvas(null);
  }, [editor, fileName, setExportCanvas]);

  return null;
}
