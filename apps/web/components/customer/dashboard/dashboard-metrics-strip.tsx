type Metric = { label: string; value: number };
export function DashboardMetricsStrip({ metrics }: { metrics: Metric[] }) {
  return (
    <dl className="flex flex-wrap items-end gap-x-10 gap-y-5">
      {metrics.map((metric, index) => (
        <div key={metric.label} className="flex items-end gap-10">
          <div className="flex flex-col gap-1.5">
            <dt className="text-xs font-medium text-muted-foreground">
              {metric.label}
            </dt>
            <dd className="font-medium text-4xl font-medium leading-none tracking-tight text-foreground">
              {metric.value}
            </dd>
          </div>
          {index < metrics.length - 1 && (
            <div aria-hidden className="hidden h-12 w-px bg-border sm:block" />
          )}
        </div>
      ))}
    </dl>
  );
}
