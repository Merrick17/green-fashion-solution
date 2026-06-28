'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DashboardHeader } from '@/components/layout';
import { VisualCard } from '@/components/design-system/visual-card';
import { JourneyRail } from '@/components/design-system/journey-rail';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { RouteError } from '@/components/shared/route-error';
import { useProjects } from '@/hooks/use-projects';
import { useProposals } from '@/hooks/use-proposals';
import { useMeetings } from '@/hooks/use-meetings';
import { useMoodboards } from '@/hooks/use-moodboards';
import { useActiveProject } from '@/hooks/use-active-project';
import { MeetingStatus, ProposalStatus } from '@repo/types';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
import { OnboardingChecklist } from '@/components/customer/onboarding-checklist';
import { DashboardProposalSpotlight } from './dashboard-proposal-spotlight';
import { ActionInbox } from './action-inbox';
import { showOnboardingChecklist } from './dashboard-utils';
import { projectStatusToJourneyStep } from '@/lib/project-journey';
import { formatDate } from '@repo/utils';

const listParams = { page: 1, limit: 12 };

export function CustomerDashboardView() {
  const { projectId: activeProjectId } = useActiveProject();
  const {
    data: projectsData,
    isLoading: loadingProjects,
    isError: errorProjects,
    refetch: refetchProjects,
  } = useProjects(listParams);
  const {
    data: proposalsData,
    isLoading: loadingProposals,
    isError: errorProposals,
    refetch: refetchProposals,
  } = useProposals(listParams);
  const {
    data: meetingsData,
    isLoading: loadingMeetings,
    isError: errorMeetings,
    refetch: refetchMeetings,
  } = useMeetings(listParams);
  const moodboardProjectId =
    activeProjectId ?? projectsData?.data?.[0]?.id ?? '';
  const { data: moodboardsData } = useMoodboards(moodboardProjectId, {
    page: 1,
    limit: 1,
  });

  const projects = projectsData?.data ?? [];
  const proposals = proposalsData?.data ?? [];
  const meetings = meetingsData?.data ?? [];
  const hasMoodboard = (moodboardsData?.data?.length ?? 0) > 0;
  const pendingProposals = proposals.filter(
    (p) => p.status === ProposalStatus.SENT,
  );
  const upcomingMeetings = meetings.filter(
    (m) => m.status === MeetingStatus.SCHEDULED,
  );
  const featuredProposal = pendingProposals[0] ?? null;
  const nextMeeting = upcomingMeetings[0];
  const hasNoProposals = proposals.length === 0;
  const onboarding = showOnboardingChecklist(projects);

  if (loadingProjects || loadingProposals || loadingMeetings) {
    return <RouteSkeleton variant="dashboard" />;
  }

  if (errorProjects || errorProposals || errorMeetings) {
    return (
      <RouteError
        reset={() => {
          void refetchProjects();
          void refetchProposals();
          void refetchMeetings();
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[var(--content-wide)] min-h-0 flex-1 flex-col gap-10 pb-8">
      <DashboardHeader
        title="Your collections"
        phase="Collection development workspace"
        showGreeting
        actions={
          <Button asChild variant="brand" size="lg">
            <Link href="/customer/projects/new">
              <Plus className="h-4 w-4" /> New collection
            </Link>
          </Button>
        }
      />

      {onboarding && (
        <OnboardingChecklist
          projects={projects}
          activeProjectId={activeProjectId}
          hasMoodboard={hasMoodboard}
        />
      )}

      {featuredProposal && (
        <DashboardProposalSpotlight proposal={featuredProposal} />
      )}

      <ActionInbox
        proposals={proposals}
        projects={projects}
        meetings={meetings}
        excludeProposalId={featuredProposal?.id}
      />

      <section className="flex flex-col gap-5">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-portal-foreground">All collections</h2>
        {projects.length === 0 ? (
          <EmptyState
            title="No collections yet"
            description="Start your first collection brief to hand off to your sourcing team."
            actionLabel="New collection"
            actionHref="/customer/projects/new"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project.id} className="space-y-4">
                <VisualCard
                  href={`/customer/projects/${project.id}`}
                  title={project.title}
                  subtitle={project.description ?? undefined}
                  imageSrc={project.coverImageUrl ?? undefined}
                  imageAlt={project.title}
                  aspect="landscape"
                  meta={
                    project.season ? (
                      <span className="bg-portal-surface/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-portal-accent">
                        {project.season}
                      </span>
                    ) : undefined
                  }
                />
                <JourneyRail
                  currentStep={projectStatusToJourneyStep(project.status)}
                  compact
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {hasNoProposals && (
        <section className="border border-portal-border bg-portal-surface px-7 py-6 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent mb-1">Preview</p>
            <p className="font-serif text-lg text-portal-foreground">What a sourcing proposal looks like</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              See a sample proposal with fabric selections, style direction, and collection structure.
            </p>
          </div>
          <Button asChild variant="brandOutline" size="sm" className="shrink-0">
            <Link href="/customer/demo">See a sample proposal &rarr;</Link>
          </Button>
        </section>
      )}

      {nextMeeting && (
        <section className="flex flex-col gap-3 border border-portal-border bg-portal-surface px-7 py-7 sm:px-8">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Upcoming review</p>
          <p className="font-serif text-xl text-portal-foreground">
            {nextMeeting.agenda?.slice(0, 60) ?? 'Collection review'}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {nextMeeting.scheduledAt
              ? formatDate(nextMeeting.scheduledAt)
              : 'To be scheduled'}
          </p>
          <Button asChild variant="brandOutline" className="mt-2 w-fit" size="sm">
            <Link href="/customer/calendar">View calendar</Link>
          </Button>
        </section>
      )}
    </div>
  );
}
