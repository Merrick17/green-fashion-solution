'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EntityTimestamps } from '@/components/shared/entity-timestamps';
interface AdminEntityRowProps {
  href?: string;
  title: string;
  subtitle?: string;
  createdAt?: string;
  updatedAt?: string;
  extraTimestamps?: { label: string; value: string }[];
  actions?: React.ReactNode;
  onDelete?: () => void;
  deleteLabel?: string;
}
export function AdminEntityRow({
  href,
  title,
  subtitle,
  createdAt,
  updatedAt,
  extraTimestamps,
  actions,
  onDelete,
  deleteLabel = 'Delete',
}: AdminEntityRowProps) {
  return (
    <div className="border border-portal-border bg-portal-surface flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-start">
      <div className="flex-1 min-w-0 space-y-1">
        {href ? (
          <Link
            href={href}
            className="font-medium truncate hover:underline cursor-pointer block"
          >
            {title}
          </Link>
        ) : (
          <p className="font-medium truncate">{title}</p>
        )}
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
        <EntityTimestamps
          createdAt={createdAt}
          updatedAt={updatedAt}
          extra={extraTimestamps}
        />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        {onDelete && (
          <Button size="sm" variant="destructive" onClick={onDelete}>
            {deleteLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
