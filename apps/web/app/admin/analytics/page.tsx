'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => apiClient.get('/admin/analytics').then((r) => r.data),
  });
}

function StatCard({ label, value, unit = '' }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="border border-border p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
        {value}
        <span className="ml-1 text-base font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading } = useAdminAnalytics();

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading analytics…</div>;
  }
  if (!data) return null;

  const statusTotal = Object.values(data.proposalsByStatus ?? {}).reduce(
    (a: number, b) => a + (b as number),
    0,
  ) as number;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Avg. Cycle Time" value={data.avgProposalCycleTimeDays ?? '—'} unit="days" />
        <StatCard label="Approval Rate" value={data.proposalApprovalRate ?? 0} unit="%" />
        <StatCard label="Asset Utilization" value={data.assetUtilizationRate ?? 0} unit="%" />
        <StatCard label="Customer Retention" value={data.customerRetentionRate ?? 0} unit="%" />
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Proposals by Status
        </h2>
        <div className="space-y-2">
          {Object.entries(data.proposalsByStatus ?? {}).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <span className="w-36 text-xs font-medium tabular-nums">{status}</span>
              <div className="flex-1 bg-border" style={{ height: 6 }}>
                <div
                  className="h-full bg-foreground"
                  style={{ width: `${statusTotal > 0 ? Math.round(((count as number) / statusTotal) * 100) : 0}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs tabular-nums">{count as number}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Projects by Status
        </h2>
        <div className="space-y-2">
          {Object.entries(data.projectsByStatus ?? {}).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <span className="w-36 text-xs font-medium">{status}</span>
              <span className="text-xs tabular-nums text-muted-foreground">{count as number}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Top Designers
        </h2>
        <div className="divide-y divide-border border border-border">
          {(data.topDesigners ?? []).map((d: { id: string; name: string; assetCount: number }) => (
            <div key={d.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="font-medium">{d.name}</span>
              <span className="text-xs text-muted-foreground">{d.assetCount} assets</span>
            </div>
          ))}
          {(data.topDesigners ?? []).length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
