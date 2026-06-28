'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, FileText, FolderKanban } from 'lucide-react';
import type { Meeting, Project, Proposal } from '@repo/types';
import { MeetingStatus, ProposalStatus } from '@repo/types';
import { proposalDisplayTitle } from '@repo/utils';
import { formatTimeAgo, isIncompleteBrief } from './dashboard-utils';

type InboxItem = {
  id: string;
  icon: typeof FileText;
  title: string;
  meta: string;
  age: string;
  href: string;
};

function buildInboxItems(
  proposals: Proposal[],
  projects: Project[],
  meetings: Meeting[],
): InboxItem[] {
  const items: InboxItem[] = [];
  for (const proposal of proposals) {
    if (proposal.status !== ProposalStatus.SENT) continue;
    items.push({
      id: `proposal-${proposal.id}`,
      icon: FileText,
      title: proposalDisplayTitle(proposal),
      meta: proposal.season ?? 'Awaiting your review',
      age: formatTimeAgo(proposal.updatedAt),
      href: `/customer/proposals/${proposal.id}`,
    });
  }
  for (const project of projects) {
    if (!isIncompleteBrief(project)) continue;
    items.push({
      id: `brief-${project.id}`,
      icon: FolderKanban,
      title: project.title,
      meta: 'Brief incomplete — add season & category',
      age: formatTimeAgo(project.updatedAt),
      href: `/customer/projects/${project.id}`,
    });
  }
  for (const meeting of meetings) {
    if (meeting.status !== MeetingStatus.REQUESTED) continue;
    items.push({
      id: `meeting-${meeting.id}`,
      icon: Calendar,
      title: 'Meeting request pending',
      meta: 'Awaiting team confirmation',
      age: formatTimeAgo(meeting.requestedAt),
      href: '/customer/calendar',
    });
  }
  return items;
}

export function ActionInbox({
  proposals,
  projects,
  meetings,
  excludeProposalId,
}: {
  proposals: Proposal[];
  projects: Project[];
  meetings: Meeting[];
  excludeProposalId?: string;
}) {
  const items = buildInboxItems(proposals, projects, meetings).filter(
    (item) => !excludeProposalId || item.id !== `proposal-${excludeProposalId}`,
  );
  if (items.length === 0) {
    return (
      <section className="border border-portal-border border-t-[3px] border-t-portal-accent bg-portal-surface-muted px-9 py-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Needs attention</p>
        <h3 className="mt-2 font-serif text-2xl tracking-tight text-portal-foreground">
          All caught up
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          No proposals, briefs, or meetings waiting on you right now.
        </p>
      </section>
    );
  }

  return (
    <section className="border border-portal-border border-t-[3px] border-t-portal-accent bg-portal-surface-muted px-9 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Needs attention</p>
          <h3 className="mt-2 font-serif text-2xl tracking-tight text-portal-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} waiting on
            you
          </h3>
        </div>
        <span className="bg-portal-accent px-3 py-1.5 text-xs font-semibold text-portal-accent-foreground">
          {items.length}
        </span>
      </div>
      <ul className="mt-6 space-y-3">
        {items.slice(0, 3).map((item) => (
          <li key={item.id}>
            <Link href={item.href} className="flex items-center gap-4 border border-portal-border bg-portal-surface p-4 transition-[border-color,background-color] duration-150 hover:border-[color-mix(in_srgb,var(--portal-accent)_30%,var(--portal-border))] hover:bg-portal-hover group">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-portal-accent-soft text-portal-accent">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-portal-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.meta}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-xs text-muted-foreground leading-relaxed sm:inline">
                  {item.age}
                </span>
                <ArrowRight className="h-4 w-4 text-portal-muted transition-transform group-hover:translate-x-0.5 group-hover:text-portal-accent" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
