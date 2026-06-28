'use client';
import { useEffect, useMemo, useState } from 'react';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { EntityList } from '@/components/shared/entity-list';
import { ProposalListCard } from '@/components/customer/proposal-list-card';
import { useProposals } from '@/hooks/use-proposals';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { ProposalStatus } from '@repo/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Filter = 'all' | 'review' | 'approved' | 'other';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'review', label: 'To review' },
  { key: 'approved', label: 'Approved' },
  { key: 'other', label: 'Other' },
];

function matchesFilter(status: ProposalStatus, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'review') return status === ProposalStatus.SENT;
  if (filter === 'approved') return status === ProposalStatus.APPROVED;
  return (
    status === ProposalStatus.REJECTED ||
    status === ProposalStatus.CHANGES_REQUESTED ||
    status === ProposalStatus.DRAFT
  );
}

export default function CustomerProposalsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const { setPage, params } = usePagination(20);
  const { data, isLoading, isError, refetch } = useProposals(params);
  const proposals = data?.data ?? [];
  useEffect(() => {
    document.title = 'My Proposals — Green';
  }, []);
  const filtered = useMemo(
    () => proposals.filter((p) => matchesFilter(p.status, filter)),
    [proposals, filter],
  );
  return (
    <AppPage>
      <PageHeader
        title="Proposals"
        description="Review curated collection proposals from your sourcing team"
      />
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as Filter)}
        className="mb-4"
      >
        <TabsList>
          {FILTERS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <EntityList
        items={filtered}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        loadingVariant="rows"
        emptyTitle={
          filter === 'all' ? 'No proposals yet' : 'No proposals in this view'
        }
        emptyDescription={
          filter === 'review'
            ? 'Proposals awaiting your review will appear here.'
            : 'Proposals will appear here once your sourcing team sends them.'
        }
        className="gap-3"
        renderItem={(p) => <ProposalListCard key={p.id} proposal={p} />}
      />
      {!isLoading && proposals.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
    </AppPage>
  );
}
