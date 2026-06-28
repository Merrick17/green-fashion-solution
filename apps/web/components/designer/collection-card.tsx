import Link from 'next/link';
import type { Collection } from '@repo/types';
interface CollectionCardProps {
  collection: Collection;
}
export function CollectionCard({ collection }: CollectionCardProps) {
  const count = collection._count?.items ?? collection.items?.length ?? 0;
  return (
    <Link
      href={`/designer/collections/${collection.id}`}
      className="border border-border bg-card block p-[var(--spacing-card-pad)] transition-colors hover:border-[color-mix(in_srgb,var(--accent)_20%,var(--border))] hover:bg-secondary/30"
    >
      <h3 className="font-medium text-foreground">{collection.name}</h3>
      {collection.description && (
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
          {collection.description}
        </p>
      )}
      <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">{count} items</p>
    </Link>
  );
}
