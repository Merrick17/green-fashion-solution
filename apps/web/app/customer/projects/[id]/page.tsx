'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AppPage } from '@/components/layout';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
import { CustomerProjectTabs } from '@/components/customer/project-detail-tabs';
import { useProject } from '@/hooks/use-projects';
import { useMilestones } from '@/hooks/use-milestones';
import { useProposals } from '@/hooks/use-proposals';
import { StatusBadge } from '@/components/shared/status-badge';

const listParams = { page: 1, limit: 100 };

export default function CustomerProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: project, isLoading } = useProject(id);
  const { data: milestonesData } = useMilestones(id, listParams);
  const { data: proposalsData } = useProposals(listParams);
  const milestones = milestonesData?.data ?? [];
  const proposals = proposalsData?.data ?? [];

  if (isLoading) return <RouteSkeleton variant="detail" />;

  if (!project) {
    return (
      <AppPage variant="dashboard" width="wide">
        <p className="text-muted-foreground leading-relaxed">Project not found</p>
        <Link
          href="/customer/projects"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-portal-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
      </AppPage>
    );
  }

  return (
    <AppPage variant="dashboard" width="wide">
      <Breadcrumb
        items={[
          { label: 'Projects', href: '/customer/projects' },
          { label: project.title },
        ]}
      />

      {(project.status === 'SUBMITTED' || project.status === 'IN_REVIEW') && (
        <div className="border-l-2 border-[--portal-accent] bg-[--surface] px-4 py-3 text-sm text-foreground">
          <span className="font-medium">Under review</span> — your sourcing team is working on your brief.
          A proposal is typically delivered within 3–5 business days.
        </div>
      )}

      <header className="border border-portal-border border-l-[3px] border-l-portal-accent bg-portal-surface px-7 py-7 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl space-y-3">
            {project.season && (
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">{project.season}</p>
            )}
            <h1 className="font-serif text-[length:var(--text-display-sm)] leading-[var(--leading-heading)] tracking-[var(--tracking-display)] tracking-tight text-portal-foreground">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-base leading-relaxed text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            )}
          </div>
          <StatusBadge status={project.status} className="shrink-0" />
        </div>
      </header>

      <CustomerProjectTabs
        project={project}
        milestones={milestones}
        proposals={proposals}
      />
    </AppPage>
  );
}
