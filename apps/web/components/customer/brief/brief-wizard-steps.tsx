import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
export const WIZARD_STEPS = [
  {
    step: 1,
    title: 'Collection',
    description: 'Name, season, and creative direction',
  },
  {
    step: 2,
    title: 'Commercials',
    description: 'Budget, volume, and delivery timeline',
  },
  {
    step: 3,
    title: 'Review',
    description: 'Confirm details and create project',
  },
] as const;
interface BriefWizardStepsProps {
  currentStep: number;
  className?: string;
}
export function BriefWizardSteps({
  currentStep,
  className,
}: BriefWizardStepsProps) {
  return (
    <nav aria-label="Brief steps" className={cn('space-y-1', className)}>
      {WIZARD_STEPS.map(({ step, title, description }) => {
        const active = step === currentStep;
        const done = step < currentStep;
        return (
          <div
            key={step}
            aria-current={active ? 'step' : undefined}
            className={cn(
              'flex gap-3 border px-4 py-3 transition-colors',
              active
                ? 'border-primary/30 bg-primary/5'
                : done
                  ? 'border-border bg-muted'
                  : 'border-transparent bg-transparent',
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center text-xs font-semibold',
                done && 'bg-primary text-primary-foreground',
                active && !done && 'bg-foreground text-portal-main',
                !active && !done && 'bg-secondary text-muted-foreground',
              )}
            >
              {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : step}
            </div>
            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  'text-sm font-medium',
                  active
                    ? 'text-foreground'
                    : done
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                )}
              >
                {title}
              </p>
              <p
                className={cn(
                  'mt-0.5 text-xs leading-relaxed',
                  active || done
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {description}
              </p>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
