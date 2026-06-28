import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DashboardHeroProps = {
  title: ReactNode;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
};

export function DashboardHero({
  title,
  description,
  eyebrow,
  actions,
  className,
}: DashboardHeroProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="max-w-2xl space-y-2">
        {eyebrow && (
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif text-2xl font-medium tracking-tight text-portal-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </div>
  );
}
