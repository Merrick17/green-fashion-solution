import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import type { Proposal } from '@repo/types';
import { countProposalAssets, proposalDisplayTitle } from '@repo/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { cn } from '@/lib/utils';

function assetCount(proposal: Proposal): number {
  return countProposalAssets(proposal.sections ?? []);
}

export function DashboardProposalSpotlight({
  proposal,
  className,
}: {
  proposal: Proposal | null;
  className?: string;
}) {
  if (!proposal) {
    return (
      <section
        className={cn(
          'border border-portal-border bg-portal-surface-muted relative overflow-hidden px-8 py-10 lg:px-10 lg:py-12',
          className,
        )}
      >
        <div className="relative z-10 max-w-2xl">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Sourcing proposal</p>
          <h2 className="mt-4 font-serif text-3xl tracking-tight text-portal-foreground lg:text-4xl">
            Your collection proposal is being prepared
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground leading-relaxed">
            Once sourcing research is complete, your team will deliver a curated
            proposal with fabrics, references, and style direction for your
            review.
          </p>
        </div>
      </section>
    );
  }

  const title = proposalDisplayTitle(proposal);
  const season = proposal.season ?? 'Curated sourcing selection';

  return (
    <section className={cn('relative overflow-hidden border border-[color-mix(in_srgb,var(--portal-accent)_35%,var(--portal-border))] bg-portal-accent px-9 py-8 text-portal-accent-foreground lg:px-12 lg:py-10', className)}>
      <div className="relative z-10 flex w-full flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
              Ready to review
            </p>
            <StatusBadge
              status={proposal.status}
              className="border-white/25 bg-white/15 text-white"
            />
          </div>
          <h2 className="mt-5 font-serif text-3xl tracking-tight lg:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-base text-white/85">{season}</p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/70">
            {assetCount(proposal)} curated assets · fabrics, references, and
            style direction selected by your sourcing team.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="h-11 shrink-0 bg-portal-surface text-portal-foreground hover:bg-white/90"
        >
          <Link href={`/customer/proposals/${proposal.id}`}>
            <FileText className="mr-2 h-4 w-4" /> Open proposal
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
