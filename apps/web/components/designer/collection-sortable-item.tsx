'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssetImage } from './asset-image';
import { cn } from '@/lib/utils';
import type { CollectionItem } from '@repo/types';
interface CollectionSortableItemProps {
  item: CollectionItem;
  isCover: boolean;
  onSetCover: () => void;
  onRemove: () => void;
}
export function CollectionSortableItem({
  item,
  isCover,
  onSetCover,
  onRemove,
}: CollectionSortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const asset = item.fabricAsset ?? item.productAsset;
  if (!asset) return null;
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'border border-border bg-card group relative overflow-hidden',
        isDragging && 'opacity-60 ring-2 ring-accent',
      )}
    >
      <AssetImage
        src={asset.imageUrl}
        alt={asset.name}
        className="aspect-square w-full object-cover"
      />
      <div className="flex items-center justify-between gap-2 p-2">
        <p className="line-clamp-1 text-xs font-medium">{asset.name}</p>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>
      {isCover && (
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground absolute left-2 top-2 bg-background/80 px-2 py-0.5">
          Cover
        </span>
      )}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          size="icon-sm"
          variant="secondary"
          onClick={onSetCover}
          aria-label="Set as cover"
        >
          <Star
            className={cn('h-3.5 w-3.5', isCover && 'fill-accent text-accent')}
          />
        </Button>
        <Button
          size="icon-sm"
          variant="secondary"
          onClick={onRemove}
          aria-label="Remove from collection"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
