import { cn } from '@/lib/utils';
import { journeySteps } from '@/lib/design-tokens';
type JourneyRailProps = {
  currentStep: string;
  compact?: boolean;
  className?: string;
};
const stepOrder = journeySteps.map((s) => s.id);
function stepIndex(id: string) {
  const i = stepOrder.indexOf(id as (typeof stepOrder)[number]);
  return i >= 0 ? i : 0;
}
export function JourneyRail({
  currentStep,
  compact,
  className,
}: JourneyRailProps) {
  const active = stepIndex(currentStep);
  return (
    <nav aria-label="Collection progress" className={cn('w-full', className)}>
      <ol className={cn('flex items-center', compact ? 'gap-1' : 'gap-2')}>
        {journeySteps.map((step, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'block h-0.5 w-full transition-colors',
                    done || current ? 'bg-brand-accent' : 'bg-border',
                  )}
                />
                {!compact && (
                  <span
                    className={cn(
                      'truncate text-[10px] font-medium uppercase tracking-wider',
                      current ? 'text-brand-accent' : 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
