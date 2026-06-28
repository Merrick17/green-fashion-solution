'use client';

import { StatusBadge } from '@/components/shared/status-badge';
import type { Task } from '@repo/types';

interface DesignerCompletedRequestsProps {
  briefs: Task[];
}

export function DesignerCompletedRequests({
  briefs,
}: DesignerCompletedRequestsProps) {
  return (
    <section className="border border-portal-border bg-portal-surface overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-portal-border px-6 py-5">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">History</p>
          <h3 className="mt-1 font-serif text-xl text-portal-foreground">
            Completed
          </h3>
        </div>
        <span className="text-sm text-muted-foreground leading-relaxed">
          {briefs.length} done
        </span>
      </div>
      {briefs.length > 0 ? (
        <ul>
          {briefs.slice(0, 5).map((brief) => (
            <li
              key={brief.id}
              className="flex items-center justify-between gap-4 border-b border-portal-border px-6 py-4 last:border-0"
            >
              <span className="truncate text-sm text-portal-foreground">
                {brief.title}
              </span>
              <StatusBadge status={brief.status} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-6 py-8 text-sm text-muted-foreground leading-relaxed">
          No completed requests yet.
        </p>
      )}
    </section>
  );
}
