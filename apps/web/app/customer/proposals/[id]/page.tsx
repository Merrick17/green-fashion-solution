'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
import { RouteError } from '@/components/shared/route-error';
import { ProposalDocumentView } from '@/components/customer/proposal-document-view';
import { ProposalChangeRequestDialog } from '@/components/customer/proposal-change-request-dialog';
import {
  ProposalActionBar,
  ProposalNotesPanel,
} from '@/components/customer/proposal-action-bar';
import { useProposal, useUpdateProposal, useRecordProposalView } from '@/hooks/use-proposals';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ProposalSectionChangeRequests } from '@/components/customer/proposal-section-change-request';
import { ProposalSamplingStatus } from '@/components/customer/proposal-sampling-status';
import { ProposalRevisionTimeline } from '@/components/customer/proposal-revision-timeline';
import { ProposalStatus } from '@repo/types';
import { proposalDisplayTitle } from '@repo/utils';

function formatMillimes(millimes: number): string {
  const value = millimes / 1000;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
export default function CustomerProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: proposal, isLoading, isError, refetch } = useProposal(id);
  const updateProposal = useUpdateProposal();
  const recordView = useRecordProposalView();
  const [confirm, setConfirm] = useState<null | 'approve' | 'reject'>(null);

  useEffect(() => {
    if (id) recordView.mutate(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  if (isLoading) return <RouteSkeleton variant="detail" />;
  if (isError) return <RouteError reset={() => void refetch()} />;
  if (!proposal)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>Proposal not found</p>
        <Button asChild variant="brandOutline" size="sm">
          <Link href="/customer/proposals">Back to proposals</Link>
        </Button>
      </div>
    );
  const respond = (status: ProposalStatus) => {
    updateProposal.mutate({ id, dto: { status } });
    setConfirm(null);
  };
  const displayTitle = proposalDisplayTitle(proposal);
  const canRespond = proposal.status === ProposalStatus.SENT;
  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-portal-main">
      <header className="z-40 flex shrink-0 items-center justify-between border-b border-border bg-portal-surface px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/customer/proposals" aria-label="Back to proposals">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-serif text-lg font-semibold tracking-tight text-foreground">
              {displayTitle}
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {proposal.season || proposal.project?.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">v{proposal.version}</span>
          <StatusBadge status={proposal.status} />
        </div>
      </header>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden pb-28 lg:pb-0">
          <ProposalDocumentView proposal={proposal} immersive />
        </main>
        <aside className="hidden w-96 flex-col border-l border-border bg-portal-surface/50 shrink-0 lg:flex">
          {canRespond && (
            <div className="shrink-0 border-b border-border bg-portal-surface p-6">
              <h3 className="mb-4 font-serif text-xl tracking-tight text-foreground">
                Your Response
              </h3>
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full text-sm font-semibold tracking-wide"
                  onClick={() => setConfirm('approve')}
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Approve Proposal
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <ProposalChangeRequestDialog
                    proposal={proposal}
                    trigger={
                      <Button
                        variant="outline"
                        className="w-full text-xs font-semibold"
                      >
                        Request Change
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    className="w-full text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setConfirm('reject')}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          )}
          <ProposalSectionChangeRequests proposal={proposal} />
          {(proposal.changeRequests?.length ?? 0) > 0 && (
            <div className="shrink-0 border-b border-border p-5">
              <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">
                Revision history
              </p>
              <ProposalRevisionTimeline proposal={proposal} />
            </div>
          )}
          {proposal.status === ProposalStatus.APPROVED && (
            <div className="shrink-0 border-b border-border p-5">
              <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">
                Sampling progress
              </p>
              <ProposalSamplingStatus proposal={proposal} />
            </div>
          )}
          {proposal.budgetSummary && proposal.budgetSummary.totalMillimes > 0 && (
            <div className="shrink-0 border-b border-border bg-portal-surface px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Estimated budget: {proposal.budgetSummary.itemCount} items — approx.{' '}
                <span className="font-semibold text-foreground">
                  {formatMillimes(proposal.budgetSummary.totalMillimes)}
                </span>
              </p>
            </div>
          )}
          <ProposalNotesPanel proposal={proposal} />
        </aside>
      </div>
      <ProposalActionBar
        proposal={proposal}
        onApprove={() => setConfirm('approve')}
        onReject={() => setConfirm('reject')}
      />
      <ConfirmDialog
        open={confirm === 'approve'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Approve this proposal?"
        description="Your team will begin sampling."
        confirmLabel="Approve"
        onConfirm={() => respond(ProposalStatus.APPROVED)}
      />
      <ConfirmDialog
        open={confirm === 'reject'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Reject this proposal?"
        description="Add a note so your team knows what to change."
        confirmLabel="Reject"
        destructive
        onConfirm={() => respond(ProposalStatus.REJECTED)}
      />
    </div>
  );
}
