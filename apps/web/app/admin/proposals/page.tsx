'use client';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { WorkspaceHeader } from '@/components/design-system/workspace-header';
import { VisualCard } from '@/components/design-system/visual-card';
import { EmptyState } from '@/components/shared/empty-state';
import { RouteError } from '@/components/shared/route-error';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
import { useProposals } from '@/hooks/use-proposals';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { ProposalStatus } from '@repo/types';
import { proposalDisplayTitle, timeAgo } from '@repo/utils';

export default function AdminProposalsPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading, isError, refetch } = useProposals(params);
  const proposals = data?.data ?? [];
  const byStatus = (status: ProposalStatus) =>
    proposals.filter((p) => p.status === status);

  if (isLoading) return <RouteSkeleton variant="list" />;
  if (isError) return <RouteError reset={() => void refetch()} />;

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col gap-8 space-y-10">
      <WorkspaceHeader
        title="Proposal builder"
        phase="Presentation-ready collection proposals"
        actions={
          <Button asChild variant="brand" size="sm">
            <Link href="/admin/proposals/new">New proposal</Link>
          </Button>
        }
      />
      {proposals.length === 0 ? (
        <EmptyState
          title="No proposals yet"
          description="Create your first sourcing proposal from curated library assets."
          actionLabel="New proposal"
          actionHref="/admin/proposals/new"
        />
      ) : (
        (['Draft', 'With client', 'Reviewed'] as const).map((label, i) => {
          const subset =
            i === 0
              ? byStatus(ProposalStatus.DRAFT)
              : i === 1
                ? byStatus(ProposalStatus.SENT)
                : proposals.filter(
                    (p) =>
                      p.status === ProposalStatus.APPROVED ||
                      p.status === ProposalStatus.REJECTED ||
                      p.status === ProposalStatus.CHANGES_REQUESTED,
                  );
          return (
            <section key={label}>
              <h2 className="mb-4 font-serif text-lg">{label}</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {subset.map((p) => (
                  <div key={p.id} className="w-64 shrink-0">
                    <VisualCard
                      href={`/admin/proposals/${p.id}`}
                      title={proposalDisplayTitle(p)}
                      subtitle={p.season ?? undefined}
                      aspect="portrait"
                      footer={
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <StatusBadge status={p.status} />
                          <span className="font-mono text-[10px] text-muted-foreground">v{p.version}</span>
                          {p.lastViewedAt && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Eye className="h-3 w-3" />
                              {timeAgo(p.lastViewedAt)}
                            </span>
                          )}
                        </div>
                      }
                    />
                  </div>
                ))}
                {subset.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No proposals in this stage.
                  </p>
                )}
              </div>
            </section>
          );
        })
      )}
      {data?.meta && (
        <PaginationControls meta={data.meta} onPageChange={setPage} />
      )}
    </div>
  );
}
