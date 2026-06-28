import { cn } from '@/lib/utils';
interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  className?: string;
}
export function StatCard({ label, value, sublabel, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'border border-border bg-card px-[var(--spacing-card-pad)] py-3 sm:py-3.5',
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-2xl font-medium leading-none sm:text-3xl">
        {value}
      </p>
      {sublabel && (
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{sublabel}</p>
      )}
    </div>
  );
}
