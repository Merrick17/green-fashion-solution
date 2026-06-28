import { cn } from '@/lib/utils';
export type MetricItem = { label: string; value: string | number };
type MetricInlineProps = { metrics: MetricItem[]; className?: string };
export function MetricInline({ metrics, className }: MetricInlineProps) {
  return (
    <dl className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {metrics.map((metric) => (
        <div key={metric.label} className="flex flex-col gap-3 border border-portal-border bg-portal-surface px-7 py-7 sm:px-8">
          <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">{metric.label}</dt>
          <dd className="font-serif text-4xl font-medium leading-tight text-portal-foreground">{metric.value}</dd>
        </div>
      ))}
    </dl>
  );
}
