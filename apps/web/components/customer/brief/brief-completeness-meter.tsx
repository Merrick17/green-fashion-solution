import type { Project } from '@repo/types';
import { getBriefCompleteness } from '@repo/utils';
import { cn } from '@/lib/utils';
import { BRIEF_FIELD_LABELS } from './brief-options';

interface BriefCompletenessMeterProps {
  project: Project;
  className?: string;
}

export function BriefCompletenessMeter({
  project,
  className,
}: BriefCompletenessMeterProps) {
  const { percent, completed, total, missing } = getBriefCompleteness(project);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-portal-foreground">
            Brief completeness
          </p>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {completed} of {total} fields complete
          </p>
        </div>
        <span className="font-serif text-3xl tabular-nums text-portal-accent">
          {percent}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden bg-portal-surface-muted">
        <div
          className="h-full bg-portal-accent transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      {missing.length > 0 && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-medium text-portal-foreground">Missing: </span>
          {missing
            .map((field) => BRIEF_FIELD_LABELS[field] ?? field)
            .join(', ')}
        </p>
      )}
    </div>
  );
}
