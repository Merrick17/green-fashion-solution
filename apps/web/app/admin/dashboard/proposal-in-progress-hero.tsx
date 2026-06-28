'use client';

import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Proposal } from '@repo/types';

function proposalClient(proposal: Proposal): string {
  return (
    proposal.project?.customer?.name ??
    proposal.project?.title ??
    `Project ${proposal.projectId.slice(0, 8)}`
  );
}

export function ProposalInProgressHero({
  proposal,
}: {
  proposal: Proposal | null;
}) {
  if (!proposal) {
    return (
      <section className="relative overflow-hidden border border-[color-mix(in_srgb,var(--portal-accent)_35%,var(--portal-border))] bg-portal-accent px-9 py-8 text-portal-accent-foreground lg:px-12 lg:py-10 flex min-h-[220px] flex-col justify-between">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
            Proposal in progress
          </p>
          <div>
            <h2 className="font-serif text-3xl tracking-tight lg:text-4xl">
              No proposals in progress
            </h2>
            <p className="mt-3 text-base text-white/80">
              Start one from a client project.
            </p>
          </div>
        </div>
        <Button
          asChild
          size="lg"
          className="mt-6 w-fit bg-portal-surface text-portal-foreground hover:bg-white/90"
        >
          <Link href="/admin/proposals/new">
            <Plus className="mr-2 h-4 w-4" /> Start a proposal
          </Link>
        </Button>
      </section>
    );
  }

  const title = proposal.title ?? 'Untitled proposal';
  const client = proposalClient(proposal);

  return (
    <section className="relative overflow-hidden border border-[color-mix(in_srgb,var(--portal-accent)_35%,var(--portal-border))] bg-portal-accent px-9 py-8 text-portal-accent-foreground lg:px-12 lg:py-10 flex min-h-[220px] flex-col justify-between">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
          Proposal in progress
        </p>
        <div>
          <h2 className="font-serif text-3xl tracking-tight lg:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-base text-white/80">{client}</p>
        </div>
      </div>
      <Button
        asChild
        size="lg"
        className="mt-6 w-fit bg-portal-surface text-portal-foreground hover:bg-white/90"
      >
        <Link href={`/admin/proposals/${proposal.id}`}>
          Open in builder <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </section>
  );
}
