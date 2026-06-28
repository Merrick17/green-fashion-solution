'use client';

import { useState } from 'react';
import { FileDown, FileImage, FileType, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCanvasStore } from '@/lib/canvas/canvas-store';
import type { MoodboardExportFormat } from '@/lib/canvas/moodboard-export.types';

export function MoodboardExportMenu() {
  const exportCanvas = useCanvasStore((s) => s.exportCanvas);
  const [busy, setBusy] = useState(false);

  const handleExport = async (format: MoodboardExportFormat) => {
    if (!exportCanvas) {
      toast.error('Canvas is still loading', {
        description: 'Wait a moment and try again.',
      });
      return;
    }

    setBusy(true);
    try {
      await exportCanvas(format);
      toast.success(`Moodboard saved as ${format.toUpperCase()}`, {
        description: 'Your download should start automatically.',
      });
    } catch (error) {
      toast.error('Export failed', {
        description:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-xs"
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileDown className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Download moodboard</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void handleExport('pdf')}>
          <FileType className="mr-2 h-4 w-4" />
          PDF presentation
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void handleExport('png')}>
          <FileImage className="mr-2 h-4 w-4" />
          PNG image
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void handleExport('svg')}>
          <FileDown className="mr-2 h-4 w-4" />
          SVG vector
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
