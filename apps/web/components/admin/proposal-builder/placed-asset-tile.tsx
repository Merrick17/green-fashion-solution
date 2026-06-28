'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { AgentContextAsset } from '@repo/types';
import type { AssetKind } from './board-state';

interface PlacedAssetTileProps {
  itemKey: string;
  sectionId: string;
  asset: AgentContextAsset | undefined;
  kind: AssetKind;
  notes: string;
  onRemove: () => void;
  onNotesChange: (notes: string) => void;
}

export function PlacedAssetTile({
  itemKey,
  sectionId,
  asset,
  kind,
  notes,
  onRemove,
  onNotesChange,
}: PlacedAssetTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemKey, data: { type: 'item', sectionId } });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex gap-2.5 border bg-portal-surface p-2.5 transition-colors',
        isDragging
          ? 'border-portal-accent bg-portal-accent-soft/30'
          : 'border-portal-border',
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="mt-1 cursor-grab touch-none text-portal-muted hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-portal-surface-muted">
        {asset ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={asset.imageUrl}
            alt={asset.name}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">
              {asset?.name ?? 'Removed asset'}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-portal-muted">
              {kind}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove from section"
            className="shrink-0 p-1 text-portal-muted hover:bg-portal-surface-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Notes for client…"
          rows={2}
          className="resize-none text-xs"
        />
      </div>
    </div>
  );
}
