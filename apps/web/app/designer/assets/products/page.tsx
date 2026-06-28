'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { EntityList } from '@/components/shared/entity-list';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { useProducts } from '@/hooks/use-assets';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { Button } from '@/components/ui/button';
import { AssetImage } from '@/components/designer/asset-image';
import { AssetListToolbar } from '@/components/designer/asset-list-toolbar';
export default function DesignerProductsPage() {
  const { setPage, params } = usePagination(12);
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useProducts({
    ...params,
    search: search || undefined,
  });
  const products = data?.data ?? [];
  useEffect(() => {
    setPage(1);
  }, [search, setPage]);
  const shown = useMemo(
    () =>
      keyword
        ? products.filter((p) => p.keywords?.includes(keyword))
        : products,
    [products, keyword],
  );
  return (
    <AppPage width="wide">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/designer' },
          { label: 'Product References' },
        ]}
      />
      <PageHeader
        title="Reference archive"
        description="Garment and product references"
        actions={
          <Button asChild size="sm">
            <Link href="/designer/assets/products/upload">Upload Product</Link>
          </Button>
        }
      />
      <EntityList
        items={shown}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        toolbar={
          <AssetListToolbar
            search={search}
            onSearchChange={setSearch}
            keywords={products.map((p) => p.keywords)}
            activeKeyword={keyword}
            onKeywordChange={setKeyword}
            placeholder="Search products…"
          />
        }
        emptyTitle="No products"
        emptyDescription="Upload product references."
        emptyActionLabel="Upload"
        emptyActionHref="/designer/assets/products/upload"
        className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4 [&>*]:break-inside-avoid"
        renderItem={(p) => (
          <div key={p.id} className="overflow-hidden bg-portal-surface">
            <AssetImage
              src={p.imageUrl}
              alt={p.name}
              className="w-full object-cover"
            />
            <div className="space-y-1 p-3">
              <p className="text-sm font-medium">{p.name}</p>
              {p.composition || p.color ? (
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {[p.composition, p.color].filter(Boolean).join(' · ')}
                </p>
              ) : (
                p.keywords?.length > 0 && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {p.keywords.join(' · ')}
                  </p>
                )
              )}
            </div>
          </div>
        )}
      />
      {!isLoading && shown.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
    </AppPage>
  );
}
