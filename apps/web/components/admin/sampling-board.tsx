'use client';
import { useUpdateProposalItem } from '@/hooks/use-proposals';
import { toast } from 'sonner';

const SAMPLING_STATUSES = [
  'NOT_STARTED',
  'IN_SAMPLING',
  'SAMPLE_APPROVED',
  'IN_PRODUCTION',
  'DELIVERED',
] as const;

type SamplingStatus = (typeof SAMPLING_STATUSES)[number];

const STATUS_LABELS: Record<SamplingStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_SAMPLING: 'In Sampling',
  SAMPLE_APPROVED: 'Sample Approved',
  IN_PRODUCTION: 'In Production',
  DELIVERED: 'Delivered',
};

interface ProposalItem {
  id: string;
  samplingStatus?: string | null;
  fabricAsset?: { name: string } | null;
  productAsset?: { name: string } | null;
  notes?: string | null;
}

interface SamplingBoardProps {
  proposalId: string;
  items: ProposalItem[];
}

function nextStatus(current: string | null | undefined): SamplingStatus {
  const idx = SAMPLING_STATUSES.indexOf((current ?? 'NOT_STARTED') as SamplingStatus);
  return SAMPLING_STATUSES[Math.min(idx + 1, SAMPLING_STATUSES.length - 1)] ?? 'DELIVERED';
}

export function SamplingBoard({ proposalId, items }: SamplingBoardProps) {
  const updateItem = useUpdateProposalItem();

  const handleCycle = (item: ProposalItem) => {
    const next = nextStatus(item.samplingStatus);
    updateItem.mutate(
      { proposalId, itemId: item.id, dto: { samplingStatus: next } },
      { onError: () => toast.error('Failed to update status') },
    );
  };

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No items in this proposal yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-2">
        {SAMPLING_STATUSES.map((status) => {
          const columnItems = items.filter(
            (i) => (i.samplingStatus ?? 'NOT_STARTED') === status,
          );
          return (
            <div key={status} className="w-44 shrink-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {STATUS_LABELS[status]}
                <span className="ml-1 text-foreground">({columnItems.length})</span>
              </p>
              <div className="space-y-2">
                {columnItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCycle(item)}
                    className="w-full border border-border bg-portal-surface p-2.5 text-left text-xs hover:border-foreground transition"
                  >
                    <p className="font-medium text-foreground line-clamp-2">
                      {item.fabricAsset?.name ?? item.productAsset?.name ?? 'Item'}
                    </p>
                    {item.notes && (
                      <p className="mt-1 line-clamp-1 text-muted-foreground">{item.notes}</p>
                    )}
                    <p className="mt-1.5 text-[10px] text-muted-foreground">Click to advance →</p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
