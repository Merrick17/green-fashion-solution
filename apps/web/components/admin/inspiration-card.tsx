'use client';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { Tag, type TagTone } from '@/components/shared/tag';
import { titleCase } from '@/components/admin/label';
import type { AdminInspiration } from '@repo/types';
import { formatDate } from '@repo/utils';
const ACTION_TONE: Record<string, TagTone> = {
  LIKED: 'accent',
  SAVED: 'warning',
  SELECTED: 'success',
}; /** * Visual inspiration-selection card: real asset thumbnail + name (the admin * inspiration endpoint includes the fabric/product asset relation), action tag, * customer, project link, and timestamp. Falls back to a placeholder when the * asset is unavailable. */
export function InspirationCard({
  selection,
}: {
  selection: AdminInspiration;
}) {
  const s = selection;
  const asset = s.fabricAsset ?? s.productAsset;
  const kind = s.fabricAssetId ? 'Fabric' : 'Product';
  return (
    <div className="border border-border bg-card flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <Tag tone={ACTION_TONE[s.action] ?? 'neutral'}>
          {titleCase(s.action)}
        </Tag>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{kind}</span>
      </div>
      {asset?.imageUrl ? (
        <div className="overflow-hidden bg-portal-surface-muted">
          <img
            src={asset.imageUrl}
            alt={asset.name}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-portal-surface-muted">
          <div className="flex flex-col items-center gap-2 text-portal-muted">
            <Package className="size-6" />
            <span className="text-xs">Asset unavailable</span>
          </div>
        </div>
      )}
      <div className="space-y-1">
        <p className="truncate text-sm text-foreground">
          {asset?.name ?? 'Unnamed asset'}
        </p>
        <p className="text-sm text-muted-foreground">{s.customer.name}</p>
        <Link
          href={`/admin/projects/${s.project.id}`}
          className="block text-sm text-foreground hover:underline"
        >
          {s.project.title}
        </Link>
        <p className="text-xs text-muted-foreground">
          {formatDate(s.createdAt)}
        </p>
      </div>
    </div>
  );
}
