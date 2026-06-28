'use client';

import type { Proposal, ProposalChangeRequest } from '@repo/types';
import { formatDate } from '@repo/utils';

interface ProposalRevisionTimelineProps {
  proposal: Proposal;
}

export function ProposalRevisionTimeline({ proposal }: ProposalRevisionTimelineProps) {
  const requests = [...(proposal.changeRequests ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (requests.length === 0) return null;

  return (
    <div className="flex flex-col gap-0">
      {requests.map((req: ProposalChangeRequest, idx) => (
        <div
          key={req.id}
          className="flex gap-3 border-b border-border py-3 last:border-b-0"
        >
          <div className="flex flex-col items-center">
            <div className="mt-1 h-2 w-2 shrink-0 bg-foreground" />
            {idx < requests.length - 1 && (
              <div className="mt-1 w-px flex-1 bg-border" />
            )}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] font-semibold text-accent">
                v{proposal.version}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {formatDate(req.createdAt)}
              </span>
            </div>
            <p className="text-xs text-foreground leading-relaxed">{req.message}</p>
            {req.sectionId && (
              <p className="mt-1 text-[10px] text-muted-foreground">
                Section comment
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
