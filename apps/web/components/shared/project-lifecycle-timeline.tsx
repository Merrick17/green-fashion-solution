import { ProjectStatus } from '@repo/types';
import { StatusBadge } from '@/components/shared/status-badge';
import { cn } from '@/lib/utils';
import type { Milestone } from '@repo/types';

const LIFECYCLE: ProjectStatus[] = [
  ProjectStatus.DRAFT,
  ProjectStatus.SUBMITTED,
  ProjectStatus.IN_REVIEW,
  ProjectStatus.SOURCING,
  ProjectStatus.PROPOSAL_READY,
  ProjectStatus.SAMPLING,
  ProjectStatus.PRODUCTION,
  ProjectStatus.COMPLETED,
];

interface ProjectLifecycleTimelineProps {
  status: ProjectStatus;
  milestones?: Milestone[];
  className?: string;
}

export function ProjectLifecycleTimeline({
  status,
  milestones = [],
  className,
}: ProjectLifecycleTimelineProps) {
  const currentIdx = LIFECYCLE.indexOf(status);

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-wrap gap-2">
        {LIFECYCLE.map((step, idx) => {
          const done =
            currentIdx > idx || status === ProjectStatus.COMPLETED;
          const active = step === status;
          return (
            <div
              key={step}
              className={cn(
                'border px-3 py-1.5 text-xs font-medium uppercase tracking-wide',
                done &&
                  'border-portal-accent/30 bg-portal-accent-soft text-portal-accent',
                active &&
                  'border-portal-accent bg-portal-accent text-portal-accent-foreground',
                !done && !active && 'border-portal-border text-muted-foreground leading-relaxed',
              )}
            >
              {step.replace(/_/g, ' ')}
            </div>
          );
        })}
      </div>

      {milestones.length > 0 && (
        <div className="space-y-3 border-t border-portal-border pt-6">
          <h4 className="text-sm font-semibold text-portal-foreground">
            Milestones
          </h4>
          <ul className="space-y-2">
            {milestones.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span
                  className={cn(
                    m.completed && 'text-muted-foreground leading-relaxed line-through',
                    !m.completed && 'text-portal-foreground',
                  )}
                >
                  {m.title}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground leading-relaxed">
                  {new Date(m.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status !== ProjectStatus.CANCELLED && (
        <div className="flex items-center gap-2 border-t border-portal-border pt-6">
          <span className="text-sm text-muted-foreground leading-relaxed">Current status</span>
          <StatusBadge status={status} />
        </div>
      )}
    </div>
  );
}
