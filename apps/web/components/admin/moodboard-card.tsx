'use client';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdminMoodboard } from '@repo/types';
interface MoodboardCardProps {
  moodboard: AdminMoodboard;
  /** Request a delete (parent owns the ConfirmDialog). */ onDelete?: (
    id: string,
    label: string,
  ) => void;
} /** * Visual moodboard card: color-palette swatch row, serif style-direction, * mood, project link, and a View action. The admin moodboards endpoint does * not include `items`, so the item count renders only when present. */
export function MoodboardCard({ moodboard, onDelete }: MoodboardCardProps) {
  const m = moodboard;
  const palette = (m.colorPalette ?? []).filter(Boolean);
  const itemCount = m.items?.length;
  return (
    <div className="border border-border bg-card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-serif text-lg leading-tight text-portal-foreground">
          {m.styleDirection}
        </h3>
        {onDelete && (
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Delete moodboard"
            onClick={() => onDelete(m.id, m.styleDirection)}
          >
            <Trash2 className="text-muted-foreground" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {palette.length > 0 ? (
          palette
            .slice(0, 8)
            .map((c, i) => (
              <span
                key={i}
                className="size-5 "
                style={{ backgroundColor: c }}
                aria-hidden
              />
            ))
        ) : (
          <span className="text-xs text-muted-foreground">No palette</span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{m.mood}</p>
      <div className="mt-1 flex items-end justify-between gap-2 border-t border-portal-border pt-3">
        <div className="min-w-0 space-y-0.5">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Project</p>
          <Link
            href={`/admin/projects/${m.project.id}`}
            className="block truncate text-sm text-foreground hover:underline"
          >
            {m.project.title}
          </Link>
          {itemCount != null && (
            <p className="text-xs text-muted-foreground">{itemCount} items</p>
          )}
        </div>
        <Button asChild variant="brandOutline" size="sm">
          <Link href={`/admin/projects/${m.project.id}`}>View</Link>
        </Button>
      </div>
    </div>
  );
}
