'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import type { Task } from '@repo/types';

interface DesignerActiveRequestsProps {
  briefs: Task[];
}

export function DesignerActiveRequests({
  briefs,
}: DesignerActiveRequestsProps) {
  return (
    <section className="border border-portal-border bg-portal-surface overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-portal-border px-6 py-5">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Work queue</p>
          <h3 className="mt-1 font-serif text-xl text-portal-foreground">
            Active requests
          </h3>
        </div>
        <Link
          href="/designer/briefs"
          className="inline-flex items-center gap-1 text-sm font-medium text-portal-accent hover:underline"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {briefs.length > 0 ? (
        <ul>
          {briefs.slice(0, 8).map((brief) => (
            <li
              key={brief.id}
              className="border-b border-portal-border last:border-0"
            >
              <Link
                href="/designer/briefs"
                className="flex items-start justify-between gap-4 px-6 py-5 transition-colors hover:bg-portal-hover"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-portal-foreground">
                    {brief.title}
                  </p>
                  {(brief.description ?? brief.deliverables) && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                      {brief.description ?? brief.deliverables}
                    </p>
                  )}
                </div>
                <StatusBadge status={brief.status} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <p className="text-base font-medium text-portal-foreground">
            All caught up
          </p>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            No active sourcing requests right now.
          </p>
        </div>
      )}
    </section>
  );
}
