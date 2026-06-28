'use client';
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentContextAsset } from '@repo/types';
interface AssetSourceTileProps {
  asset: AgentContextAsset;
  placed: boolean;
  onAdd: () => void;
}
export function AssetSourceTile({
  asset,
  placed,
  onAdd,
}: AssetSourceTileProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={placed}
      title={placed ? `${asset.name} — already in board` : `Add ${asset.name}`}
      className={cn(
        'group relative flex flex-col overflow-hidden border bg-portal-surface text-left transition-colors',
        placed
          ? 'border-portal-accent opacity-80'
          : 'border-portal-border hover:border-portal-accent/50',
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-portal-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.imageUrl}
          alt={asset.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center border border-portal-border bg-portal-surface">
          {placed ? (
            <Check className="h-3.5 w-3.5 text-portal-accent" />
          ) : (
            <Plus className="h-3.5 w-3.5 text-foreground" />
          )}
        </span>
      </div>
      <div className="space-y-0.5 p-2.5">
        <p className="truncate text-xs font-medium text-foreground">
          {asset.name}
        </p>
        {asset.keywords?.length ? (
          <p className="truncate text-[11px] text-portal-muted">
            {asset.keywords.slice(0, 2).join(' · ')}
          </p>
        ) : null}
      </div>
    </button>
  );
}
