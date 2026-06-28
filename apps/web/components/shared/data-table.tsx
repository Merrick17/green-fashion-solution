'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { SortOrder } from '@repo/types';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyState?: ReactNode;
  toolbar?: ReactNode;
  bulkActions?: ReactNode;
  className?: string;
}

type SortDir = SortOrder | null;

function compareValues<T>(col: DataTableColumn<T>, a: T, b: T): number {
  const av = (a as Record<string, unknown>)[col.key];
  const bv = (b as Record<string, unknown>)[col.key];
  if (av == null && bv == null) return 0;
  if (av == null) return -1;
  if (bv == null) return 1;
  if (typeof av === 'number' && typeof bv === 'number') return av - bv;
  return String(av).localeCompare(String(bv));
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  isLoading,
  emptyState,
  toolbar,
  bulkActions,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const sortedRows = useMemo(() => {
    if (!sortKey || !sortDir) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return rows;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => compareValues(col, a, b) * dir);
  }, [rows, sortKey, sortDir, columns]);

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  };

  const ariaSort = (key: string) =>
    sortKey === key
      ? sortDir === 'asc'
        ? 'ascending'
        : 'descending'
      : undefined;

  return (
    <div className={cn('space-y-3', className)}>
      {(toolbar || bulkActions) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">{toolbar}</div>
          {bulkActions && (
            <div className="flex items-center gap-2">{bulkActions}</div>
          )}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="border-portal-border">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  'h-9 px-3 py-2',
                  col.sortable && 'cursor-pointer select-none',
                  col.className,
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                aria-sort={ariaSort(col.key)}
              >
                <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <span aria-hidden className="text-portal-accent">
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`sk-${i}`} className="border-portal-border">
                {columns.map((col) => (
                  <TableCell key={col.key} className="px-3 py-2">
                    <span className="block h-3.5 w-3/4 bg-portal-surface-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : sortedRows.length === 0 ? (
            <TableRow className="border-portal-border">
              <TableCell
                colSpan={columns.length}
                className="px-3 py-10 text-center"
              >
                {emptyState ?? (
                  <span className="text-sm text-portal-muted">No records</span>
                )}
              </TableCell>
            </TableRow>
          ) : (
            sortedRows.map((row) => (
              <TableRow
                key={getRowKey(row)}
                className={cn(
                  'border-portal-border hover:bg-portal-surface-muted',
                  onRowClick && 'cursor-pointer',
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn('px-3 py-2', col.className)}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
