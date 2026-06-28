import type { ReactNode } from 'react';
import {
  CardSkeleton,
  Skeleton,
  TableSkeleton,
} from '@/components/shared/skeleton';
import { AppPage } from '@/components/layout';
import { cn } from '@/lib/utils';

type RouteSkeletonVariant =
  | 'list'
  | 'detail'
  | 'dashboard'
  | 'form'
  | 'canvas'
  | 'canvas-toolbar'
  | 'calendar'
  | 'masonry';

interface RouteSkeletonProps {
  variant?: RouteSkeletonVariant;
  className?: string;
}

const skeletonRenderers: Record<
  RouteSkeletonVariant,
  (className?: string) => ReactNode
> = {
  dashboard: (className) => (
    <AppPage variant="dashboard" width="wide" className={className}>
      <Skeleton className="h-28 w-full" />
      <div className="grid gap-6 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-48 w-full" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </AppPage>
  ),
  detail: (className) => (
    <AppPage width="wide" className={className}>
      <Skeleton className="h-4 w-32" /> <Skeleton className="h-10 w-64" />
      <CardSkeleton /> <CardSkeleton />
    </AppPage>
  ),
  form: (className) => (
    <AppPage width="narrow" className={className}>
      <Skeleton className="h-10 w-48" /> <CardSkeleton />
    </AppPage>
  ),
  canvas: (className) => <Skeleton className={cn('h-full w-full', className)} />,
  'canvas-toolbar': (className) => (
    <div className={cn('flex h-full flex-col', className)}>
      <Skeleton className="h-14 w-full shrink-0" />
      <Skeleton className="h-full w-full" />
    </div>
  ),
  calendar: (className) => (
    <div className={cn('flex min-h-0 flex-1 flex-col gap-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col border border-portal-border bg-portal-surface">
          <div className="grid grid-cols-7 border-b border-portal-border">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
            {Array.from({ length: 42 }).map((_, i) => (
              <Skeleton
                key={i}
                className="border-b border-r border-portal-border"
              />
            ))}
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-col border border-portal-border bg-portal-surface lg:w-80">
          <Skeleton className="h-11 w-full border-b border-portal-border" />
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
  masonry: (className) => (
    <div className={cn('flex flex-col', className)}>
      <div className="border-b border-portal-border bg-portal-surface px-6 py-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-4 px-6 py-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              'w-full',
              i % 3 === 0 ? 'h-40' : i % 3 === 1 ? 'h-56' : 'h-48',
            )}
          />
        ))}
      </div>
    </div>
  ),
  list: (className) => (
    <AppPage width="wide" className={className}>
      <Skeleton className="h-10 w-48" /> <TableSkeleton />
    </AppPage>
  ),
};

export function RouteSkeleton({
  variant = 'list',
  className,
}: RouteSkeletonProps) {
  return skeletonRenderers[variant](className);
}
