'use client';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FileText,
  Factory,
  FlaskConical,
} from 'lucide-react';
import type { Milestone, Project, Proposal } from '@repo/types';
import { ProjectStatus, ProposalStatus } from '@repo/types';
import { proposalDisplayTitle } from '@repo/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { cn } from '@/lib/utils';
const EXECUTION_STATUSES = new Set<ProjectStatus>([
  ProjectStatus.SAMPLING,
  ProjectStatus.PRODUCTION,
  ProjectStatus.COMPLETED,
]);
const PHASE_LABELS: Partial<Record<ProjectStatus, string>> = {
  [ProjectStatus.SAMPLING]: 'Sampling',
  [ProjectStatus.PRODUCTION]: 'Production',
  [ProjectStatus.COMPLETED]: 'Completed',
};

function phaseLabel(status: ProjectStatus): string {
  return PHASE_LABELS[status] ?? 'Execution';
}
function groupMilestones(milestones: Milestone[]) {
  const sampling = milestones.filter((m) =>
    /sample|sampling|proto|fit/i.test(m.title),
  );
  const production = milestones.filter((m) =>
    /production|delivery|bulk|manufactur|ship/i.test(m.title),
  );
  const other = milestones.filter(
    (m) => !sampling.includes(m) && !production.includes(m),
  );
  return { sampling, production, other };
}
function MilestoneList({
  items,
  emptyLabel,
}: {
  items: Milestone[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((m) => (
        <li key={m.id} className="flex items-start gap-3 text-sm">
          {m.completed ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          ) : (
            <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
          )}
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'font-medium',
                m.completed && 'text-muted-foreground line-through',
              )}
            >
              {m.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(m.date).toLocaleDateString(undefined, {
                dateStyle: 'medium',
              })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
type Props = {
  project: Project;
  milestones: Milestone[];
  approvedProposal?: Proposal | null;
  className?: string;
};
export function ExecutionHub({
  project,
  milestones,
  approvedProposal,
  className,
}: Props) {
  if (!EXECUTION_STATUSES.has(project.status)) return null;
  const { sampling, production, other } = groupMilestones(milestones);
  const proposalTitle = approvedProposal
    ? proposalDisplayTitle(approvedProposal)
    : null;
  return (
    <section
      className={cn(
        'relative overflow-hidden border border-portal-border bg-portal-surface p-6 lg:p-8',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Execution hub</p>
          <h2 className="mt-2 font-serif text-2xl tracking-tight text-portal-foreground lg:text-3xl">
            {phaseLabel(project.status)} — {project.title}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground leading-relaxed">
            Track sampling milestones, production deadlines, and access your
            approved sourcing proposal.
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="border border-portal-border bg-portal-surface-muted p-5">
          <div className="mb-4 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-portal-accent" />
            <h3 className="text-sm font-semibold text-portal-foreground">
              Sampling
            </h3>
          </div>
          <MilestoneList
            items={sampling.length ? sampling : other}
            emptyLabel="Sampling milestones will appear here."
          />
        </div>
        <div className="border border-portal-border bg-portal-surface-muted p-5">
          <div className="mb-4 flex items-center gap-2">
            <Factory className="h-4 w-4 text-portal-accent" />
            <h3 className="text-sm font-semibold text-portal-foreground">
              Production
            </h3>
          </div>
          <MilestoneList
            items={production}
            emptyLabel="Production milestones will appear here."
          />
        </div>
        <div className="border border-portal-border bg-portal-surface-muted p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-portal-accent" />
            <h3 className="text-sm font-semibold text-portal-foreground">
              Approved proposal
            </h3>
          </div>
          {approvedProposal ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-portal-foreground">
                {proposalTitle}
              </p>
              <StatusBadge status={approvedProposal.status} className="w-fit" />
              <Button asChild size="sm" variant="brandOutline" className="w-full">
                <Link href={`/customer/proposals/${approvedProposal.id}`}>
                  View proposal <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your approved proposal will be linked here once sourcing is
              finalized.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
export function findApprovedProposal(proposals: Proposal[], projectId: string) {
  return (
    proposals.find(
      (p) => p.projectId === projectId && p.status === ProposalStatus.APPROVED,
    ) ?? null
  );
}
export { EXECUTION_STATUSES };
