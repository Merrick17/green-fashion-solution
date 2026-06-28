'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Palette, Search, ChevronDown, ChevronUp } from 'lucide-react';
import type { Project, Milestone, Proposal } from '@repo/types';
import { ProjectStatus } from '@repo/types';
import { BriefQaThread } from '@/components/shared/brief-qa-thread';
import { JourneyRail } from '@/components/design-system/journey-rail';
import { ProjectTabNav } from '@/components/customer/project-tab-nav';
import { ProjectOverviewTab } from '@/components/customer/project-overview-tab';
import { ProjectTabPlaceholder } from '@/components/customer/project-tab-placeholder';
import {
  ExecutionHub,
  findApprovedProposal,
} from '@/components/customer/execution/execution-hub';
import { ProposalDocumentView } from '@/components/customer/proposal-document-view';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { projectStatusToJourneyStep } from '@/lib/project-journey';

type Props = {
  project: Project;
  milestones: Milestone[];
  proposals: Proposal[];
};

export function CustomerProjectTabs({ project, milestones, proposals }: Props) {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? 'overview';
  const [qaOpen, setQaOpen] = useState(false);
  const approvedProposal = findApprovedProposal(proposals, project.id);
  const projectProposals = proposals.filter((p) => p.projectId === project.id);
  const inExecution = [
    ProjectStatus.SAMPLING,
    ProjectStatus.PRODUCTION,
    ProjectStatus.COMPLETED,
  ].includes(project.status);

  return (
    <div className="flex flex-col gap-5 mt-2">
      <JourneyRail currentStep={projectStatusToJourneyStep(project.status)} />
      <ProjectTabNav projectId={project.id} activeTab={tab} />

      {tab === 'overview' && (
        <>
          <ProjectOverviewTab project={project} milestones={milestones} />
          <div className="border border-portal-border bg-portal-surface">
            <button
              type="button"
              onClick={() => setQaOpen((o) => !o)}
              className="flex w-full items-center justify-between px-5 py-4 text-sm font-medium text-portal-foreground hover:bg-portal-surface-muted transition-colors"
            >
              <span>Brief Q&amp;A</span>
              {qaOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {qaOpen && (
              <BriefQaThread projectId={project.id} />
            )}
          </div>
        </>
      )}

      {tab === 'inspiration' && (
        <ProjectTabPlaceholder
          eyebrow="Curated assets"
          title="Browse inspiration"
          description="Like, save, and select fabrics and references for your sourcing proposal."
          actionLabel="Open inspiration"
          actionHref={`/customer/inspiration?projectId=${project.id}`}
          icon={Sparkles}
        />
      )}

      {tab === 'moodboard' && (
        <ProjectTabPlaceholder
          eyebrow="Visual direction"
          title="Develop your moodboard"
          description="Co-design visual direction with AI and upload references for your collection."
          actionLabel="Open moodboard"
          actionHref={`/customer/moodboard/create?projectId=${project.id}`}
          icon={Palette}
        />
      )}

      {tab === 'research' && (
        <section className="border border-portal-border bg-portal-surface-muted p-8 lg:p-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-portal-accent-soft text-portal-accent mb-4">
            <Search className="h-5 w-5" />
          </div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">In progress</p>
          <h2 className="mt-2 font-serif text-2xl text-portal-foreground">
            Your team is sourcing materials
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground leading-relaxed">
            Fabrics and references are being researched internally. You will be
            notified when your proposal is ready for review.
          </p>
        </section>
      )}

      {tab === 'proposal' && (
        <section className="flex flex-col gap-5">
          {projectProposals.length === 0 ? (
            <section className="border border-portal-border bg-portal-surface border-dashed px-6 py-14 text-center">
              <p className="font-serif text-xl text-portal-foreground">
                Proposal pending
              </p>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                Your sourcing proposal will appear here when ready.
              </p>
            </section>
          ) : (
            projectProposals.map((proposal) => (
              <div key={proposal.id} className="border border-portal-border bg-portal-surface p-6 lg:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <StatusBadge status={proposal.status} />
                  <Button asChild variant="brandOutline" size="sm">
                    <Link href={`/customer/proposals/${proposal.id}`}>
                      Full presentation
                    </Link>
                  </Button>
                </div>
                <ProposalDocumentView proposal={proposal} />
              </div>
            ))
          )}
        </section>
      )}

      {tab === 'execution' && (
        <section>
          {inExecution ? (
            <ExecutionHub
              project={project}
              milestones={milestones}
              approvedProposal={approvedProposal}
            />
          ) : (
            <section className="border border-portal-border bg-portal-surface px-6 py-14 text-center">
              <p className="font-serif text-xl text-portal-foreground">
                Execution tracking
              </p>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                Sampling and production milestones open after proposal approval.
              </p>
            </section>
          )}
        </section>
      )}
    </div>
  );
}
