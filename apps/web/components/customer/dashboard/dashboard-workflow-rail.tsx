import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@repo/types';

const STEPS = [
  { key: 'intake', label: 'Intake' },
  { key: 'sourcing', label: 'Sourcing' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'sampling', label: 'Sampling' },
  { key: 'production', label: 'Production' },
] as const;

function stepIndex(status: ProjectStatus): number {
  switch (status) {
    case 'DRAFT':
    case 'SUBMITTED':
      return 0;
    case 'IN_REVIEW':
    case 'SOURCING':
      return 1;
    case 'PROPOSAL_READY':
      return 2;
    case 'SAMPLING':
      return 3;
    case 'PRODUCTION':
    case 'COMPLETED':
      return 4;
    default:
      return 0;
  }
}

export function DashboardWorkflowRail({
  status,
  compact = false,
}: {
  status: ProjectStatus;
  compact?: boolean;
}) {
  const current = stepIndex(status);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.key} className="flex min-w-0 flex-1 items-center">
            <div
              className={cn(
                'flex min-w-0 flex-col items-center',
                compact ? 'gap-1' : 'gap-1.5',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center font-semibold transition-colors',
                  compact ? 'h-6 w-6 text-[9px]' : 'h-7 w-7 text-[10px]',
                  done && 'bg-portal-accent text-portal-accent-foreground',
                  active &&
                    'bg-portal-foreground text-portal-main ring-2 ring-portal-accent/30',
                  !done &&
                    !active &&
                    'bg-portal-surface-muted text-muted-foreground leading-relaxed',
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  'font-medium uppercase',
                  compact
                    ? 'mt-1 block text-center text-[9px] tracking-tight'
                    : 'hidden text-[10px] tracking-wide sm:block',
                  active ? 'text-portal-accent' : 'text-muted-foreground leading-relaxed',
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-1 h-px flex-1',
                  compact ? 'mb-0' : 'mb-4 sm:mb-5',
                  i < current ? 'bg-portal-accent/50' : 'bg-portal-border',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
