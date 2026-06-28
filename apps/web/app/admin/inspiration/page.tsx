'use client';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { EntityList } from '@/components/shared/entity-list';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { InspirationCard } from '@/components/admin/inspiration-card';
import { useAdminInspiration } from '@/hooks/use-admin';
import { usePagination } from '@/hooks/use-pagination';
export default function AdminInspirationPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading } = useAdminInspiration(params);
  const selections = data?.data ?? [];
  return (
    <AppPage width="full" className="space-y-4">
      <PageHeader
        title="Inspiration Selections"
        description="Customer asset selections for proposals"
      />
      <EntityList
        items={selections}
        isLoading={isLoading}
        loadingVariant="card"
        emptyTitle="No selections"
        emptyDescription="Customer inspiration selections will appear here."
        className="sm:grid-cols-2 lg:grid-cols-3"
        renderItem={(s) => <InspirationCard key={s.id} selection={s} />}
      />
      {!isLoading && selections.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
    </AppPage>
  );
}
