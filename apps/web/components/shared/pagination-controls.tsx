'use client';
import { Button } from '@/components/ui/button';
import type { PaginatedMeta } from '@repo/types';
interface PaginationControlsProps {
  meta?: PaginatedMeta;
  onPageChange: (page: number) => void;
  className?: string;
}
export function PaginationControls({
  meta,
  onPageChange,
  className,
}: PaginationControlsProps) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div
      className={`flex items-center justify-between gap-4 pt-4 ${className ?? ''}`}
    >
      <p className="text-sm text-muted-foreground">
        Page {meta.page} of {meta.totalPages} · {meta.total} total
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasPreviousPage}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
