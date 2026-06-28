'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, type DataTableColumn } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { RowActions } from '@/components/admin/row-actions';
import { buildLeadsColumns } from '@/components/admin/leads-columns';
import { titleCase } from '@/components/admin/label';
import { ConvertDialog } from './convert-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useAdminLeads,
  useDeleteAdminLead,
  useUpdateAdminLead,
  useAdminWaitlist,
  useDeleteAdminWaitlistEntry,
} from '@/hooks/use-admin';
import { usePagination } from '@/hooks/use-pagination';
import { LeadStatus, type Lead, type WaitlistEntry } from '@repo/types';
import { formatDate } from '@repo/utils';

const LEAD_STATUSES = Object.values(LeadStatus);

export default function AcquisitionPage() {
  const leadsPage = usePagination(20);
  const waitlistPage = usePagination(20);
  const { data: leadsData, isLoading: leadsLoading } = useAdminLeads(leadsPage.params);
  const { data: waitlistData, isLoading: waitlistLoading } = useAdminWaitlist(waitlistPage.params);
  const deleteLead = useDeleteAdminLead();
  const updateLead = useUpdateAdminLead();
  const deleteEntry = useDeleteAdminWaitlistEntry();

  const [leadQuery, setLeadQuery] = useState('');
  const [leadStatus, setLeadStatus] = useState('ALL');
  const [waitlistQuery, setWaitlistQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string; type: 'lead' | 'waitlist' } | null>(null);
  const [convertTarget, setConvertTarget] = useState<WaitlistEntry | null>(null);

  const leads = leadsData?.data ?? [];
  const waitlistEntries = waitlistData?.data ?? [];

  const filteredLeads = leads.filter((l) => {
    if (leadStatus !== 'ALL' && l.status !== leadStatus) return false;
    const q = leadQuery.trim().toLowerCase();
    return !q || [l.brand, l.name, l.email].some((f) => f.toLowerCase().includes(q));
  });

  const filteredWaitlist = waitlistEntries.filter((e) => {
    const q = waitlistQuery.trim().toLowerCase();
    return !q || [e.name, e.brand, e.email].some((f) => f.toLowerCase().includes(q));
  });

  const leadsColumns = buildLeadsColumns({
    onToggle: (l: Lead) => {
      const next = l.status === LeadStatus.CONTACTED ? LeadStatus.NEW : LeadStatus.CONTACTED;
      updateLead.mutate({ id: l.id, dto: { status: next } }, {
        onSuccess: () => toast.success(next === LeadStatus.CONTACTED ? 'Marked as contacted' : 'Marked as new'),
        onError: () => toast.error('Could not update lead'),
      });
    },
    onDelete: (l: Lead) => setDeleteTarget({ id: l.id, label: `${l.brand} · ${l.name}`, type: 'lead' }),
  });

  const waitlistColumns: DataTableColumn<WaitlistEntry>[] = [
    { key: 'name', header: 'Name', sortable: true, render: (e) => <span className="font-medium">{e.name}</span> },
    { key: 'brand', header: 'Brand', sortable: true },
    { key: 'email', header: 'Email', sortable: true, render: (e) => <span className="text-muted-foreground">{e.email}</span> },
    { key: 'createdAt', header: 'Submitted', sortable: true, render: (e) => <span className="text-muted-foreground">{formatDate(e.createdAt)}</span> },
    {
      key: 'actions', header: '', className: 'text-right',
      render: (e) => (
        <RowActions items={[
          { label: 'Convert to customer', onSelect: () => setConvertTarget(e) },
          { label: 'Delete', destructive: true, onSelect: () => setDeleteTarget({ id: e.id, label: `${e.name} · ${e.brand}`, type: 'waitlist' }) },
        ]} />
      ),
    },
  ];

  return (
    <AppPage width="full" className="space-y-4">
      <PageHeader title="Acquisition" description="Manage leads and waitlist signups" />
      <Tabs defaultValue="leads">
        <TabsList className="mb-4">
          <TabsTrigger value="leads">Leads {leadsData?.meta.total ? `(${leadsData.meta.total})` : ''}</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist {waitlistData?.meta.total ? `(${waitlistData.meta.total})` : ''}</TabsTrigger>
        </TabsList>
        <TabsContent value="leads" className="space-y-4">
          <DataTable
            columns={leadsColumns} rows={filteredLeads} getRowKey={(l) => l.id} isLoading={leadsLoading}
            toolbar={
              <>
                <Input placeholder="Search brand, name, email…" value={leadQuery} onChange={(e) => setLeadQuery(e.target.value)} className="h-8 w-56" />
                <Select value={leadStatus} onValueChange={setLeadStatus}>
                  <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{titleCase(s)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </>
            }
          />
          {!leadsLoading && leads.length > 0 && <PaginationControls meta={leadsData?.meta} onPageChange={leadsPage.setPage} />}
        </TabsContent>
        <TabsContent value="waitlist" className="space-y-4">
          <DataTable
            columns={waitlistColumns} rows={filteredWaitlist} getRowKey={(e) => e.id} isLoading={waitlistLoading}
            toolbar={<Input placeholder="Search name, brand, email…" value={waitlistQuery} onChange={(e) => setWaitlistQuery(e.target.value)} className="h-8 w-56" />}
          />
          {!waitlistLoading && waitlistEntries.length > 0 && <PaginationControls meta={waitlistData?.meta} onPageChange={waitlistPage.setPage} />}
        </TabsContent>
      </Tabs>
      <ConvertDialog entry={convertTarget} onClose={() => setConvertTarget(null)} />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={deleteTarget?.type === 'lead' ? 'Delete lead' : 'Delete waitlist entry'}
        description={`Delete "${deleteTarget?.label}" permanently? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          const { id, type } = deleteTarget;
          setDeleteTarget(null);
          if (type === 'lead') {
            deleteLead.mutate(id, { onSuccess: () => toast.success('Lead deleted'), onError: () => toast.error('Could not delete lead') });
          } else {
            deleteEntry.mutate(id, { onSuccess: () => toast.success('Entry deleted'), onError: () => toast.error('Could not delete entry') });
          }
        }}
      />
    </AppPage>
  );
}
