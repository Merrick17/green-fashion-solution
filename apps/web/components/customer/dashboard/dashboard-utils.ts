import {
  MeetingStatus,
  ProjectStatus,
  ProposalStatus,
  type Meeting,
  type Project,
  type Proposal,
} from '@repo/types';
import { formatDateTime, proposalDisplayTitle } from '@repo/utils';

export function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDateTime(date);
}

export type ActivityEvent = {
  id: string;
  kind: 'proposal_sent' | 'meeting_scheduled' | 'status_changed';
  label: string;
  sublabel?: string;
  href: string;
  at: string;
};

export function buildActivityEvents(
  proposals: Proposal[],
  meetings: Meeting[],
  projects: Project[],
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (const proposal of proposals) {
    if (proposal.status === ProposalStatus.SENT) {
      events.push({
        id: `proposal-${proposal.id}`,
        kind: 'proposal_sent',
        label: 'Proposal sent for review',
        sublabel: proposalDisplayTitle(proposal),
        href: `/customer/proposals/${proposal.id}`,
        at: proposal.updatedAt,
      });
    }
  }

  for (const meeting of meetings) {
    if (meeting.status === MeetingStatus.SCHEDULED) {
      events.push({
        id: `meeting-${meeting.id}`,
        kind: 'meeting_scheduled',
        label: 'Meeting scheduled',
        sublabel: meeting.scheduledAt
          ? formatDateTime(meeting.scheduledAt)
          : 'Date pending',
        href: '/customer/calendar',
        at: meeting.scheduledAt ?? meeting.updatedAt,
      });
    }
  }

  for (const project of projects) {
    if (
      project.status !== ProjectStatus.DRAFT &&
      new Date(project.updatedAt).getTime() >
        new Date(project.createdAt).getTime()
    ) {
      events.push({
        id: `project-${project.id}-${project.updatedAt}`,
        kind: 'status_changed',
        label: `Status updated to ${project.status.replace(/_/g, ' ').toLowerCase()}`,
        sublabel: project.title,
        href: `/customer/projects/${project.id}`,
        at: project.updatedAt,
      });
    }
  }

  return events
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 5);
}

export function isIncompleteBrief(project: Project): boolean {
  return (
    project.status === ProjectStatus.DRAFT &&
    (!project.season?.trim() || !project.category?.trim())
  );
}

export function showOnboardingChecklist(projects: Project[]): boolean {
  return (
    projects.length === 0 ||
    projects.every((p) => p.status === ProjectStatus.DRAFT)
  );
}
