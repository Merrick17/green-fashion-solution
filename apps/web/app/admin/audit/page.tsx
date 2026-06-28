'use client';
import { useState } from 'react';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { titleCase } from '@/components/admin/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminAuditLogs } from '@/hooks/use-admin';
import { usePagination } from '@/hooks/use-pagination';
import { AuditAction, type AdminAuditLog } from '@repo/types';
const ACTION_VARIANT: Record<string, string> = {
  CREATE: 'bg-success/10 text-success',
  UPDATE: 'bg-warning/10 text-warning',
  DELETE: 'bg-error/10 text-error',
};
const ACTION_OPTIONS = Object.values(AuditAction);
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
export default function AdminAuditPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading } = useAdminAuditLogs(params);
  const logs = data?.data ?? [];
  const [query, setQuery] = useState('');
  const [action, setAction] = useState<string>('ALL');
  const filtered = logs.filter((l) => {
    if (action !== 'ALL' && l.action !== action) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [l.entity, l.entityId ?? '', l.user.name, l.user.email].some((s) =>
      s.toLowerCase().includes(q),
    );
  });
  const columns: DataTableColumn<AdminAuditLog>[] = [
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (l) => (
        <Badge variant="outline" className={ACTION_VARIANT[l.action] ?? ''}>
          {titleCase(l.action)}
        </Badge>
      ),
    },
    {
      key: 'entity',
      header: 'Entity',
      sortable: true,
      render: (l) => (
        <span className="font-medium">
          {l.entity}
          <span className="ml-1 text-xs text-muted-foreground">
            {l.entityId?.slice(0, 8)}
          </span>
        </span>
      ),
    },
    {
      key: 'user',
      header: 'Actor',
      render: (l) => (
        <span>
          <span className="font-medium">{l.user.name}</span>
          <span className="ml-1 text-xs text-muted-foreground">
            ({l.user.email})
          </span>
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'When',
      sortable: true,
      render: (l) => (
        <span
          className="text-muted-foreground"
          title={new Date(l.createdAt).toLocaleString()}
        >
          {relativeTime(l.createdAt)}
        </span>
      ),
    },
  ];
  return (
    <AppPage width="full" className="space-y-4">
      <PageHeader
        title="Audit Log"
        description="State-changing operations across the platform"
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(l) => l.id}
        isLoading={isLoading}
        toolbar={
          <>
            <Input
              placeholder="Search entity, actor…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-56"
            />
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="h-8 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All actions</SelectItem>
                {ACTION_OPTIONS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {titleCase(a)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />
      {!isLoading && logs.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
    </AppPage>
  );
}
