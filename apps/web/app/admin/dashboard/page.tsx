'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DashboardHeader } from '@/components/layout';
import { VisualCard } from '@/components/design-system/visual-card';
import { Button } from '@/components/ui/button';
import { RouteError } from '@/components/shared/route-error';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
import { useAdminOverview } from '@/hooks/use-admin';
import { useProjects } from '@/hooks/use-projects';
import { useProposals } from '@/hooks/use-proposals';
import { ProposalStatus } from '@repo/types';
import { ProposalInProgressHero } from './proposal-in-progress-hero';
import { EmptyState } from '@/components/shared/empty-state';

const listParams = { page: 1, limit: 100 };

export default function AdminDashboardPage() {
  const {
    data: overview,
    isLoading: loadingOverview,
    isError: errorOverview,
    refetch: refetchOverview,
  } = useAdminOverview();
  const {
    data: proposalsData,
    isLoading: loadingProposals,
    isError: errorProposals,
    refetch: refetchProposals,
  } = useProposals(listParams);
  const { data: projectsData } = useProjects({ page: 1, limit: 6 });

  useEffect(() => {
    document.title = 'Overview — Green Admin';
  }, []);

  const proposals = proposalsData?.data ?? [];
  const projects = projectsData?.data ?? [];
  const draftProposals = proposals.filter(
    (p) => p.status === ProposalStatus.DRAFT,
  );
  const featuredProposal = draftProposals[0] ?? null;

  if (loadingOverview || loadingProposals) {
    return <RouteSkeleton variant="dashboard" />;
  }

  if (errorOverview || errorProposals) {
    return (
      <RouteError
        reset={() => {
          void refetchOverview();
          void refetchProposals();
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[var(--content-wide)] min-h-0 flex-1 flex-col gap-10 pb-8">
      <DashboardHeader
        title="Proposal orchestration"
        phase="Continue building your collections"
        showGreeting
        actions={
          <Button asChild variant="brand" size="lg">
            <Link href="/admin/proposals/new">
              <Plus className="h-4 w-4" /> New proposal
            </Link>
          </Button>
        }
      />

      <ProposalInProgressHero proposal={featuredProposal} />

      <section className="flex flex-col gap-5">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-portal-foreground">Incoming collections</h2>
        {projects.length === 0 ? (
          <EmptyState
            title="No incoming collections"
            description="Customer projects will appear here once brands submit briefs."
            actionLabel="View projects"
            actionHref="/admin/projects"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <VisualCard
                key={project.id}
                href={`/admin/projects/${project.id}`}
                title={project.title}
                subtitle={project.description ?? undefined}
                aspect="landscape"
              />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3 border border-portal-border bg-portal-surface px-7 py-7 sm:px-8">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Research queue</p>
          <p className="font-serif text-4xl font-medium leading-tight text-portal-foreground">{overview?.tasks ?? 0}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">Open sourcing briefs</p>
          <Button asChild variant="brandOutline" size="sm" className="mt-2 w-fit">
            <Link href="/admin/tasks">View briefs</Link>
          </Button>
        </div>
        <div className="flex flex-col gap-3 border border-portal-border bg-portal-surface px-7 py-7 sm:px-8">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Library</p>
          <p className="font-serif text-4xl font-medium leading-tight text-portal-foreground">{overview?.assets ?? 0}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sourcing assets indexed
          </p>
        </div>
      </section>
    </div>
  );
}
