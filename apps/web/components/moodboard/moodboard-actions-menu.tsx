'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useDeleteMoodboard, useResetMoodboard } from '@/hooks/use-moodboards';
import { useCanvasStore } from '@/lib/canvas/canvas-store';

interface MoodboardActionsMenuProps {
  moodboardId: string;
  projectId: string;
}

export function MoodboardActionsMenu({
  moodboardId,
  projectId,
}: MoodboardActionsMenuProps) {
  const router = useRouter();
  const resetMoodboard = useResetMoodboard();
  const deleteMoodboard = useDeleteMoodboard();
  const setAiPanelOpen = useCanvasStore((s) => s.setAiPanelOpen);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const busy = resetMoodboard.isPending || deleteMoodboard.isPending;

  const handleReset = () => {
    resetMoodboard.mutate(moodboardId, {
      onSuccess: () => {
        setResetOpen(false);
        setAiPanelOpen(false);
      },
    });
  };

  const handleDelete = () => {
    deleteMoodboard.mutate(moodboardId, {
      onSuccess: () => {
        setDeleteOpen(false);
        router.replace(`/customer/moodboard/create?projectId=${projectId}`);
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={busy}
            aria-label="Moodboard options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setResetOpen(true)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear canvas
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete moodboard
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Clear canvas?"
        description="This removes all items, snapshots, and AI chat history. The moodboard itself stays so you can start fresh."
        confirmLabel="Clear canvas"
        destructive
        onConfirm={handleReset}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete moodboard?"
        description="This permanently deletes the moodboard and everything on it. You can create a new one afterward."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </>
  );
}
