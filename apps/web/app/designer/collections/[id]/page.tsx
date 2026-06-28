'use client';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
import { NotFoundView } from '@/components/shared/not-found';
import { AssetImage } from '@/components/designer/asset-image';
import { CollectionBoard } from '@/components/designer/collection-board';
import { AppPage } from '@/components/layout';
import { useCollection } from '@/hooks/use-collections';
export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: collection, isLoading } = useCollection(id);
  if (isLoading) return <RouteSkeleton variant="detail" />;
  if (!collection) {
    return (
      <NotFoundView
        basePath="/designer"
        title="Collection not found"
        description="This collection may have been deleted, or you do not have access to it."
      />
    );
  }
  const items = collection.items ?? [];
  const coverItem =
    items.find((i) => i.id === collection.coverItemId) ?? items[0];
  const coverAsset = coverItem?.fabricAsset ?? coverItem?.productAsset;
  return (
    <AppPage width="wide">
      <Breadcrumb
        items={[
          { label: 'Collections', href: '/designer/collections' },
          { label: collection.name },
        ]}
      />
      <PageHeader
        title={collection.name}
        description={collection.description}
      />
      {coverAsset && (
        <div className="overflow-hidden ">
          <AssetImage
            src={coverAsset.imageUrl}
            alt={coverAsset.name}
            className="h-48 w-full object-cover sm:h-64"
          />
        </div>
      )}
      <CollectionBoard collection={collection} />
    </AppPage>
  );
}
