'use client';
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import type { Proposal } from '@repo/types';
const shortcuts = [
  { href: '/admin/projects', label: 'Projects', desc: 'Active requests' },
  { href: '/admin/tasks', label: 'Tasks', desc: 'Sourcing ops' },
  { href: '/admin/moodboards', label: 'Moodboards', desc: 'Client vision' },
  { href: '/admin/users', label: 'Users', desc: 'Manage accounts' },
];
export function DashboardSideRail({ proposals }: { proposals: Proposal[] }) {
  const recentProposals = proposals.slice(0, 6);
  return (
    <div className="flex min-h-0 flex-col gap-4 xl:col-span-4">
      <section className="shrink-0 border border-portal-border bg-portal-surface">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-portal-border px-5 py-4">
          Shortcuts
        </h3>
        <ul>
          {shortcuts.map((item) => (
            <li
              key={item.href}
              className="border-b border-portal-border last:border-0"
            >
              <Link
                href={item.href}
                className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-portal-surface-muted"
              >
                <span className="flex flex-col">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{item.desc}</span>
                  <span className="text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-portal-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden border border-portal-border bg-portal-surface">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">
            Recent proposals
          </h3>
          <Link
            href="/admin/proposals"
            className="text-xs text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {recentProposals.length > 0 ? (
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {recentProposals.map((proposal) => (
              <li
                key={proposal.id}
                className="border-b border-border last:border-0"
              >
                <Link
                  href={`/admin/proposals/${proposal.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-secondary">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="truncate text-sm font-medium">
                      {proposal.title ??
                        `Project ${proposal.projectId.slice(0, 8)}`}
                    </span>
                  </div>
                  <StatusBadge status={proposal.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-5 text-sm text-muted-foreground">No proposals yet.</p>
        )}
      </section>
    </div>
  );
}
