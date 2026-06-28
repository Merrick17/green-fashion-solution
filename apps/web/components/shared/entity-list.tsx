import type { ReactNode } from 'react';
import { EmptyState } from '@/components/shared/empty-state';
import {
  CardSkeleton,
  Skeleton,
  TableSkeleton,
} from '@/components/shared/skeleton';
import { RouteError } from '@/components/shared/route-error';
import { cn } from '@/lib/utils';

interface EntityListProps<T> {
  items: T[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  loadingVariant?: 'card' | 'table' | 'rows';
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  toolbar?: ReactNode;
  renderItem: (item: T) => React.ReactNode;
  className?: string;
}

export function EntityList<T>({
  items,
  isLoading,
  isError,
  onRetry,
  loadingVariant = 'card',
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionHref,
  toolbar,
  renderItem,
  className,
}: EntityListProps<T>) {
  if (isError) {
    return <RouteError reset={onRetry} />;
  }

  const listBody = (() => {
    if (isLoading) {
      if (loadingVariant === 'table') return <TableSkeleton />;
      if (loadingVariant === 'rows') return <Skeleton className="h-32 w-full" />;
      return <CardSkeleton />;
    }
    if (items.length === 0) {
      return (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          actionHref={emptyActionHref}
        />
      );
    }
    return (
      <div className={cn('grid gap-[--spacing-card-gap]', className)}>{items.map(renderItem)}</div>
    );
  })();

  if (!toolbar) {
    return listBody;
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-portal-border pb-4">{toolbar}</div>
      {listBody}
    </div>
  );
}
