'use client';
import Link from 'next/link';
import { ArrowRight, FolderKanban } from 'lucide-react';
import { useActiveProject } from '@/hooks/use-active-project';
import { StatusBadge } from '@/components/shared/status-badge';
import { cn } from '@/lib/utils';
import { DashboardWorkflowRail } from './dashboard-workflow-rail';
import type { Meeting, Project } from '@repo/types';
export function DashboardProjectsPanel({
  projects,
  className,
}: {
  projects: Project[];
  className?: string;
}) {
  const { setProjectId } = useActiveProject();
  return (
    <section
      className={cn('flex flex-col overflow-hidden border border-portal-border bg-portal-surface', className)}
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Your projects
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Collections in development
          </p>
        </div>
        <Link
          href="/customer/projects"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </div>
      {projects.length > 0 ? (
        <ul>
          {projects.slice(0, 5).map((project) => (
            <li
              key={project.id}
              className="border-b border-border last:border-0"
            >
              <Link
                href={`/customer/projects/${project.id}`}
                className="flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-muted/60"
                onClick={() => setProjectId(project.id)}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-secondary">
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="truncate text-sm font-medium">
                    {project.title}
                  </span>
                </div>
                <StatusBadge status={project.status} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-6 py-8 text-sm text-muted-foreground">
          No projects yet.
        </p>
      )}
    </section>
  );
}
export function DashboardFeaturedPanels({
  project,
  nextMeeting,
}: {
  project?: Project | null;
  nextMeeting?: Meeting | null;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col border border-portal-border bg-portal-surface p-7 lg:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Project progress
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {project?.title ?? 'No active project selected'}
            </p>
          </div>
          {project && <StatusBadge status={project.status} />}
        </div>
        {project ? (
          <div className="flex flex-1 flex-col">
            <DashboardWorkflowRail status={project.status} />
            <p className="mt-6 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
            <Link
              href={`/customer/projects/${project.id}`}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              View project <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Submit your first collection brief to begin the sourcing workflow.
          </p>
        )}
      </div>
      <div className="flex flex-col border border-portal-border bg-portal-surface p-7 lg:p-8">
        <h3 className="text-base font-semibold text-foreground">
          Next meeting
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Scheduled reviews with your sourcing team
        </p>
        {nextMeeting ? (
          <div className="mt-6 flex flex-1 flex-col">
            <p className="text-lg font-medium text-foreground">
              Sourcing review
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {nextMeeting.scheduledAt
                ? new Date(nextMeeting.scheduledAt).toLocaleString(undefined, {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })
                : 'Date pending'}
            </p>
            <StatusBadge status={nextMeeting.status} className="mt-4 w-fit" />
            <Link
              href="/customer/calendar"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Open calendar <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-1 flex-col">
            <p className="text-sm leading-relaxed text-muted-foreground">
              No meetings scheduled yet. Request a review when you&apos;re ready
              to discuss your collection.
            </p>
            <Link
              href="/customer/meetings/request"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Request a review <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
