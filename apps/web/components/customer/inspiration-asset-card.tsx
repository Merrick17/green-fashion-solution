'use client';

import {
  Bookmark,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { InspirationAction } from '@repo/types';
import { cn } from '@/lib/utils';

type InspirationAssetCardProps = {
  asset: {
    id: string;
    type: string;
    name: string;
    imageUrl: string;
    selections: { action: InspirationAction }[];
  };
  onToggle: (action: InspirationAction) => void;
};

const actionBtn =
  'flex h-8 w-8 items-center justify-center border border-portal-border bg-portal-surface/95 text-portal-foreground transition-colors hover:border-portal-accent hover:bg-portal-accent-soft';

export function InspirationAssetCard({
  asset,
  onToggle,
}: InspirationAssetCardProps) {
  const isLiked = asset.selections.some(
    (s) => s.action === InspirationAction.LIKED,
  );
  const isSaved = asset.selections.some(
    (s) => s.action === InspirationAction.SAVED,
  );
  const isSelected = asset.selections.some(
    (s) => s.action === InspirationAction.SELECTED,
  );

  return (
    <article className="group border border-portal-border bg-portal-surface overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-portal-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.imageUrl}
          alt={asset.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 border-t border-portal-border bg-portal-surface p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onToggle(InspirationAction.LIKED)}
              className={cn(
                actionBtn,
                isLiked && 'border-portal-accent bg-portal-accent text-portal-accent-foreground',
              )}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
            </button>
            <button
              type="button"
              onClick={() => onToggle(InspirationAction.SAVED)}
              className={cn(
                actionBtn,
                isSaved && 'border-portal-accent bg-portal-accent-soft text-portal-accent',
              )}
              aria-label={isSaved ? 'Unsave' : 'Save'}
            >
              <Bookmark className={cn('h-4 w-4', isSaved && 'fill-current')} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onToggle(InspirationAction.SELECTED)}
            className={cn(
              'flex w-full items-center justify-center gap-2 border py-2 text-xs font-semibold transition-colors',
              isSelected
                ? 'border-portal-accent bg-portal-accent text-portal-accent-foreground'
                : 'border-portal-border bg-portal-surface text-portal-foreground hover:border-portal-accent',
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSelected ? 'Selected for proposal' : 'Select for proposal'}
          </button>
        </div>
        <div className="absolute left-3 top-3 flex gap-1.5">
          {isSelected && (
            <span className="rounded-full h-2 w-2 bg-portal-accent ring-2 ring-portal-surface" />
          )}
          {isLiked && (
            <span className="rounded-full h-2 w-2 bg-portal-accent ring-2 ring-portal-surface" />
          )}
          {isSaved && (
            <span className="rounded-full h-2 w-2 bg-portal-muted ring-2 ring-portal-surface" />
          )}
        </div>
      </div>
      <div className="border-t border-portal-border p-3">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 text-portal-accent">{asset.type}</p>
        <p
          className="truncate text-sm font-medium text-portal-foreground"
          title={asset.name}
        >
          {asset.name}
        </p>
      </div>
    </article>
  );
}
