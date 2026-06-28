import type { ReactNode } from 'react';
import { DashboardHeader } from '@/components/layout';
import { MetricInline, type MetricItem } from './metric-inline';
import { cn } from '@/lib/utils';

type DashboardShellProps = {
  title: string;
  description?: string;
  name?: string;
  actions?: ReactNode;
  metrics?: MetricItem[];
  children: ReactNode;
  className?: string;
};

export function DashboardShell({
  title,
  description,
  name,
  actions,
  metrics,
  children,
  className,
}: DashboardShellProps) {
  return (
    <div className={cn('mx-auto flex w-full max-w-[var(--content-wide)] min-h-0 flex-1 flex-col gap-10 pb-8', className)}>
      <DashboardHeader
        name={name}
        title={title}
        phase={description}
        actions={actions}
      />
      {metrics && metrics.length > 0 && <MetricInline metrics={metrics} />}
      {children}
    </div>
  );
}
