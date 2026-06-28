'use client';

const MILESTONE_LABELS: Record<string, string> = {
  GENERAL: 'General',
  SAMPLE_REQUEST: 'Sample Requested',
  SAMPLE_PRODUCED: 'Produced',
  SAMPLE_SHIPPED: 'Shipped',
  CUSTOMER_RECEIVED: 'Received by Client',
  FEEDBACK_DUE: 'Feedback Due',
  PRODUCTION_START: 'Production Started',
  DELIVERY: 'Delivery',
};

interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  type?: string | null;
}

interface SamplingTimelineProps {
  milestones: Milestone[];
}

export function SamplingTimeline({ milestones }: SamplingTimelineProps) {
  const sorted = [...milestones].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">No milestones yet.</p>;
  }
  return (
    <div className="space-y-3">
      {sorted.map((m) => (
        <div key={m.id} className="flex items-start gap-3">
          <div
            className={`mt-1 h-3 w-3 shrink-0 border ${
              m.completed
                ? 'bg-foreground border-foreground'
                : 'bg-transparent border-muted-foreground'
            }`}
          />
          <div>
            <p
              className={`text-sm font-medium ${
                m.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}
            >
              {MILESTONE_LABELS[m.type ?? 'GENERAL'] ?? m.type ?? 'General'}
            </p>
            <p className="text-xs text-muted-foreground">
              {m.title} · {new Date(m.date).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
