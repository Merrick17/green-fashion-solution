'use client';
import Link from 'next/link';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { EntityList } from '@/components/shared/entity-list';
import { useCollections } from '@/hooks/use-collections';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { Button } from '@/components/ui/button';
import { CollectionCard } from '@/components/designer/collection-card';
export default function DesignerCollectionsPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading } = useCollections(params);
  const collections = data?.data ?? [];
  return (
    <AppPage width="wide">
      <PageHeader
        title="Collections"
        description="Organize fabrics and product references"
        actions={
          <Button asChild>
            <Link href="/designer/collections/new">New collection</Link>
          </Button>
        }
      />
      <EntityList
        items={collections}
        isLoading={isLoading}
        emptyTitle="No collections yet"
        emptyDescription="Group your assets into curated collections."
        emptyActionLabel="New collection"
        emptyActionHref="/designer/collections/new"
        className="sm:grid-cols-2 lg:grid-cols-3"
        renderItem={(c) => <CollectionCard key={c.id} collection={c} />}
      />
      {!isLoading && collections.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
    </AppPage>
  );
}
