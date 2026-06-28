'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { EntityList } from '@/components/shared/entity-list';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { useFabrics, useAssetStats } from '@/hooks/use-assets';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AssetImage } from '@/components/designer/asset-image';
import { AssetListToolbar } from '@/components/designer/asset-list-toolbar';
import type { FabricAsset } from '@repo/types';

function FabricTile({ f }: { f: FabricAsset }) {
  const { data: stats } = useAssetStats(f.id, 'fabric');
  const dotColor =
    f.availabilityStatus === 'AVAILABLE'
      ? 'bg-green-500'
      : f.availabilityStatus === 'LOW_STOCK'
        ? 'bg-amber-500'
        : f.availabilityStatus === 'DISCONTINUED'
          ? 'bg-red-500'
          : null;
  return (
    <div className="overflow-hidden bg-portal-surface">
      <div className="relative">
        <AssetImage src={f.imageUrl} alt={f.name} className="w-full object-cover" />
        {dotColor && (
          <span className={`absolute right-2 top-2 h-2.5 w-2.5 rounded-full ${dotColor}`} />
        )}
      </div>
      <div className="space-y-1 p-3">
        <p className="text-sm font-medium">{f.name}</p>
        {f.composition || f.color ? (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {[f.composition, f.color].filter(Boolean).join(' · ')}
          </p>
        ) : (
          f.keywords?.length > 0 && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {f.keywords.join(' · ')}
            </p>
          )
        )}
        {stats && stats.proposalCount > 0 && (
          <p className="text-xs font-medium text-muted-foreground">
            Used in {stats.proposalCount} proposal{stats.proposalCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}

export default function DesignerFabricsPage() {
  const { setPage, params } = usePagination(12);
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState<string | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState('');
  const { data, isLoading, isError, refetch } = useFabrics({
    ...params,
    search: search || undefined,
    availabilityStatus: availabilityStatus || undefined,
  });
  const fabrics = data?.data ?? [];
  useEffect(() => {
    document.title = 'Fabrics Library — Green Designer';
  }, []);
  useEffect(() => {
    setPage(1);
  }, [search, availabilityStatus, setPage]);
  const shown = useMemo(
    () =>
      keyword ? fabrics.filter((f) => f.keywords?.includes(keyword)) : fabrics,
    [fabrics, keyword],
  );
  return (
    <AppPage width="wide">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/designer' },
          { label: 'Fabric Library' },
        ]}
      />
      <PageHeader
        title="Fabric archive"
        description="Browse and contribute sourcing fabrics"
        actions={
          <Button asChild size="sm">
            <Link href="/designer/assets/fabrics/upload">Upload Fabric</Link>
          </Button>
        }
      />
      <EntityList
        items={shown}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        toolbar={
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <AssetListToolbar
                search={search}
                onSearchChange={setSearch}
                keywords={fabrics.map((f) => f.keywords)}
                activeKeyword={keyword}
                onKeywordChange={setKeyword}
                placeholder="Search fabrics…"
              />
              <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                  <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
        emptyTitle="No fabrics"
        emptyDescription="Upload your first fabric reference."
        emptyActionLabel="Upload"
        emptyActionHref="/designer/assets/fabrics/upload"
        className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4 [&>*]:break-inside-avoid"
        renderItem={(f) => <FabricTile key={f.id} f={f} />}
      />
      {!isLoading && shown.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
    </AppPage>
  );
}
