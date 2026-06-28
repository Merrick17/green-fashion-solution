'use client';
import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useMoodboardSnapshots,
  useCreateMoodboardSnapshot,
} from '@/hooks/use-moodboard-snapshots';
import type { MoodboardSnapshot } from '@repo/types';
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
function itemCount(snapshot: MoodboardSnapshot): number {
  return snapshot.document?.items?.length ?? 0;
}
export function MoodboardSnapshotMenu({
  moodboardId,
}: {
  moodboardId: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: snapshots = [], isLoading } =
    useMoodboardSnapshots(moodboardId);
  const createSnapshot = useCreateMoodboardSnapshot(moodboardId);
  const handleSave = () => {
    createSnapshot.mutate(
      { aiSummary: undefined },
      {
        onSuccess: () =>
          toast.success('Snapshot saved', {
            description: 'The current canvas state was captured.',
          }),
        onError: () =>
          toast.error('Could not save snapshot', {
            description: 'Please try again in a moment.',
          }),
      },
    );
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Camera className="h-4 w-4" /> Snapshots
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Saved snapshots</DialogTitle>
          <DialogDescription>
            Point-in-time captures of this board. Read-only — the live canvas is
            never changed.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between gap-3 bg-portal-surface px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground">
              Save current state
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              Capture the board as it is right now.
            </p>
          </div>
          <Button
            size="sm"
            className="h-8 shrink-0 gap-1.5"
            disabled={createSnapshot.isPending}
            onClick={handleSave}
          >
            {createSnapshot.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
            Save
          </Button>
        </div>
        <ScrollArea className="max-h-72">
          {isLoading ? (
            <p className="px-1 py-4 text-center text-xs text-muted-foreground">
              Loading snapshots…
            </p>
          ) : snapshots.length === 0 ? (
            <p className="px-1 py-6 text-center text-xs text-muted-foreground">
              No snapshots yet. Save one to keep this version of the board.
            </p>
          ) : (
            <ul className="space-y-2 pr-3">
              {snapshots.map((snapshot) => (
                <li key={snapshot.id} className=" bg-portal-surface px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {formatDate(snapshot.createdAt)}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {itemCount(snapshot)} items
                    </Badge>
                  </div>
                  {snapshot.aiSummary ? (
                    <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                      {snapshot.aiSummary}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
