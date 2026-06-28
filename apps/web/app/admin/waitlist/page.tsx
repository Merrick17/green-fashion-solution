'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { RowActions } from '@/components/admin/row-actions';
import { Input } from '@/components/ui/input';
import {
  useAdminWaitlist,
  useDeleteAdminWaitlistEntry,
} from '@/hooks/use-admin';
import { usePagination } from '@/hooks/use-pagination';
import type { WaitlistEntry } from '@repo/types';
import { formatDate } from '@repo/utils';
export default function AdminWaitlistPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading } = useAdminWaitlist(params);
  const deleteEntry = useDeleteAdminWaitlistEntry();
  const entries = data?.data ?? [];
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [query, setQuery] = useState('');
  const filtered = entries.filter((e) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [e.name, e.brand, e.email].some((f) => f.toLowerCase().includes(q));
  });
  const columns: DataTableColumn<WaitlistEntry>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (e) => <span className="font-medium">{e.name}</span>,
    },
    { key: 'brand', header: 'Brand', sortable: true },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (e) => <span className="text-muted-foreground">{e.email}</span>,
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      sortable: true,
      render: (e) => (
        <span className="text-muted-foreground">{formatDate(e.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (e) => (
        <>
          {/* TODO: "Convert" — no waitlist->project path yet. */}
          <RowActions
            items={[
              {
                label: 'Delete',
                destructive: true,
                onSelect: () =>
                  setDeleteTarget({
                    id: e.id,
                    label: `${e.name} · ${e.brand}`,
                  }),
              },
            ]}
          />
        </>
      ),
    },
  ];
  return (
    <AppPage width="full" className="space-y-4">
      <PageHeader
        title="Waitlist"
        description="Pilot program waitlist signups"
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(e) => e.id}
        isLoading={isLoading}
        toolbar={
          <Input
            placeholder="Search name, brand, email…"
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            className="h-8 w-56"
          />
        }
      />
      {!isLoading && entries.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete waitlist entry"
        description={`Delete "${deleteTarget?.label}" permanently? This cannot be undone.`}
        confirmLabel="Delete entry"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          const id = deleteTarget.id;
          setDeleteTarget(null);
          deleteEntry.mutate(id, {
            onSuccess: () => toast.success('Entry deleted'),
            onError: () => toast.error('Could not delete entry'),
          });
        }}
      />
    </AppPage>
  );
}
