import { cn } from '@/lib/utils';
interface SkeletonProps {
  className?: string;
}
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse bg-secondary', className)} />;
}
export function CardSkeleton() {
  return (
    <div className=" border bg-surface-elevated p-6 space-y-3">
      <Skeleton className="h-4 w-1/3" /> <Skeleton className="h-8 w-1/2" />
    </div>
  );
}
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-1/4" /> <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );
}
