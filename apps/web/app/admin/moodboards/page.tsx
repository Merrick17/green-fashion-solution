'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { EntityList } from '@/components/shared/entity-list';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { MoodboardCard } from '@/components/admin/moodboard-card';
import { useAdminMoodboards, useDeleteAdminMoodboard } from '@/hooks/use-admin';
import { usePagination } from '@/hooks/use-pagination';
export default function AdminMoodboardsPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading } = useAdminMoodboards(params);
  const deleteMoodboard = useDeleteAdminMoodboard();
  const moodboards = data?.data ?? [];
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  return (
    <AppPage width="full" className="space-y-4">
      <PageHeader
        title="Moodboards"
        description="Customer AI-generated moodboards"
      />
      <EntityList
        items={moodboards}
        isLoading={isLoading}
        loadingVariant="card"
        emptyTitle="No moodboards"
        emptyDescription="Customer moodboards will appear here."
        className="sm:grid-cols-2 lg:grid-cols-3"
        renderItem={(m) => (
          <MoodboardCard
            key={m.id}
            moodboard={m}
            onDelete={(id, label) => setDeleteTarget({ id, label })}
          />
        )}
      />
      {!isLoading && moodboards.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete moodboard"
        description={`Delete "${deleteTarget?.label}" permanently? This cannot be undone.`}
        confirmLabel="Delete moodboard"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          const id = deleteTarget.id;
          setDeleteTarget(null);
          deleteMoodboard.mutate(id, {
            onSuccess: () => toast.success('Moodboard deleted'),
            onError: () => toast.error('Could not delete moodboard'),
          });
        }}
      />
    </AppPage>
  );
}
