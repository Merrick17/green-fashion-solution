'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { RouteError } from '@/components/shared/route-error';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { buildLeadsColumns } from '@/components/admin/leads-columns';
import { titleCase } from '@/components/admin/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAdminLeads,
  useDeleteAdminLead,
  useUpdateAdminLead,
} from '@/hooks/use-admin';
import { usePagination } from '@/hooks/use-pagination';
import { LeadStatus, type Lead } from '@repo/types';
const STATUS_OPTIONS = Object.values(LeadStatus);
export default function AdminLeadsPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading, isError, refetch } = useAdminLeads(params);
  const deleteLead = useDeleteAdminLead();
  const updateLead = useUpdateAdminLead();
  const leads = data?.data ?? [];
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  if (isError) {
    return (
      <AppPage width="full" className="space-y-4">
        <PageHeader
          title="Leads"
          description="Landing page consultation requests"
        />
        <RouteError reset={refetch} />
      </AppPage>
    );
  }
  const toggleContacted = (lead: Lead) => {
    const next =
      lead.status === LeadStatus.CONTACTED
        ? LeadStatus.NEW
        : LeadStatus.CONTACTED;
    updateLead.mutate(
      { id: lead.id, dto: { status: next } },
      {
        onSuccess: () =>
          toast.success(
            next === LeadStatus.CONTACTED
              ? 'Marked as contacted'
              : 'Marked as new',
          ),
        onError: () => toast.error('Could not update lead'),
      },
    );
  };
  const filtered = leads.filter((l) => {
    if (status !== 'ALL' && l.status !== status) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [l.brand, l.name, l.email].some((f) => f.toLowerCase().includes(q));
  });
  const columns = buildLeadsColumns({
    onToggle: toggleContacted,
    onDelete: (l) =>
      setDeleteTarget({ id: l.id, label: `${l.brand} · ${l.name}` }),
  });
  return (
    <AppPage width="full" className="space-y-4">
      <PageHeader
        title="Leads"
        description="Landing page consultation requests"
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(l) => l.id}
        isLoading={isLoading}
        toolbar={
          <>
            <Input
              placeholder="Search brand, name, email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-56"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {titleCase(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />
      {!isLoading && leads.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete lead"
        description={`Delete "${deleteTarget?.label}" permanently? This cannot be undone.`}
        confirmLabel="Delete lead"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          const id = deleteTarget.id;
          setDeleteTarget(null);
          deleteLead.mutate(id, {
            onSuccess: () => toast.success('Lead deleted'),
            onError: () => toast.error('Could not delete lead'),
          });
        }}
      />
    </AppPage>
  );
}
