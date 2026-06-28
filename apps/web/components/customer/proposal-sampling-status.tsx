'use client';

import type { Proposal, ProposalItem } from '@repo/types';

const SAMPLING_STATUSES = [
  'NOT_STARTED',
  'IN_SAMPLING',
  'SAMPLE_APPROVED',
  'IN_PRODUCTION',
  'DELIVERED',
] as const;

type SamplingStatus = (typeof SAMPLING_STATUSES)[number];

const STATUS_LABELS: Record<SamplingStatus, string> = {
  NOT_STARTED: 'Pending',
  IN_SAMPLING: 'In Sampling',
  SAMPLE_APPROVED: 'Approved',
  IN_PRODUCTION: 'Production',
  DELIVERED: 'Delivered',
};

const STATUS_COLORS: Record<SamplingStatus, string> = {
  NOT_STARTED: 'text-muted-foreground bg-muted/30 border-border',
  IN_SAMPLING: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800',
  SAMPLE_APPROVED: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
  IN_PRODUCTION: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800',
  DELIVERED: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800',
};

type ItemWithSampling = ProposalItem & { samplingStatus?: string | null };

function getSamplingStatus(item: ItemWithSampling): SamplingStatus {
  const s = item.samplingStatus ?? 'NOT_STARTED';
  return SAMPLING_STATUSES.includes(s as SamplingStatus)
    ? (s as SamplingStatus)
    : 'NOT_STARTED';
}

interface ProposalSamplingStatusProps {
  proposal: Proposal;
}

export function ProposalSamplingStatus({ proposal }: ProposalSamplingStatusProps) {
  const allItems = proposal.sections.flatMap((s) =>
    s.items.map((item) => ({ ...item, sectionTitle: s.title })),
  ) as (ItemWithSampling & { sectionTitle: string })[];

  if (allItems.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No items to track yet.
      </p>
    );
  }

  const delivered = allItems.filter((i) => getSamplingStatus(i) === 'DELIVERED').length;
  const total = allItems.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-xl font-semibold tabular-nums text-foreground">
          {delivered}
        </span>
        <span className="text-xs text-muted-foreground">/ {total} delivered</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {allItems.map((item) => {
          const status = getSamplingStatus(item);
          const name =
            item.fabricAsset?.name ?? item.productAsset?.name ?? 'Item';
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 border border-border bg-portal-surface px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                  {name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {item.sectionTitle}
                </p>
              </div>
              <span
                className={`shrink-0 border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${STATUS_COLORS[status]}`}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
