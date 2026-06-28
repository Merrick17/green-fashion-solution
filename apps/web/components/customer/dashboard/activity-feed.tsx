import Link from 'next/link';
import { ArrowRight, Calendar, FileText, RefreshCw } from 'lucide-react';
import type { Meeting, Project, Proposal } from '@repo/types';
import { cn } from '@/lib/utils';
import { buildActivityEvents, formatTimeAgo } from './dashboard-utils';
const ICONS = {
  proposal_sent: FileText,
  meeting_scheduled: Calendar,
  status_changed: RefreshCw,
} as const;
export function ActivityFeed({
  proposals,
  meetings,
  projects,
  className,
}: {
  proposals: Proposal[];
  meetings: Meeting[];
  projects: Project[];
  className?: string;
}) {
  const events = buildActivityEvents(proposals, meetings, projects);
  return (
    <section className={cn('flex flex-col border border-portal-border bg-portal-surface p-7 lg:p-8', className)}>
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Recent activity
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest updates across your collection
        </p>
      </div>
      {events.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No recent activity yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-2">
          {events.map((event) => {
            const Icon = ICONS[event.kind];
            return (
              <li key={event.id}>
                <Link
                  href={event.href}
                  className="group flex items-start gap-4 p-4 transition-colors hover:bg-muted/60"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-secondary text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {event.label}
                    </p>
                    {event.sublabel && (
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {event.sublabel}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2 pt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(event.at)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
