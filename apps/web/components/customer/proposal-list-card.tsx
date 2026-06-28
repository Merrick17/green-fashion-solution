import Link from 'next/link';
import type { Proposal } from '@repo/types';
import { ProposalStatus } from '@repo/types';
import {
  countProposalAssets,
  formatDateTime,
  proposalDisplayTitle,
} from '@repo/utils';
import { StatusBadge } from '@/components/shared/status-badge';
import { FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
type Props = { proposal: Proposal };
export function ProposalListCard({ proposal }: Props) {
  const title = proposalDisplayTitle(proposal);
  const assetCount = countProposalAssets(proposal.sections ?? []);
  const needsReview = proposal.status === ProposalStatus.SENT;
  return (
    <Link
      href={`/customer/proposals/${proposal.id}`}
      className={cn(
        'group block overflow-hidden border transition-all',
        needsReview
          ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
          : 'border border-portal-border bg-portal-surface',
      )}
    >
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center',
            needsReview
              ? 'bg-primary/15 text-primary'
              : 'bg-secondary text-muted-foreground',
          )}
        >
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-medium text-foreground">{title}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {[proposal.season, proposal.project?.title]
                  .filter(Boolean)
                  .join(' · ') || 'Collection proposal'}
              </p>
            </div>
            <StatusBadge status={proposal.status} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>v{proposal.version}</span> <span>{assetCount} assets</span>
            <span>Updated {formatDateTime(proposal.updatedAt)}</span>
          </div>
          {needsReview && (
            <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
              Review proposal
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
