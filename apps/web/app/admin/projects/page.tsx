'use client';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { buildProjectsColumns } from '@/components/admin/projects-columns';
import { titleCase } from '@/components/admin/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjects, useUpdateProject } from '@/hooks/use-projects';
import { useDeleteAdminProject } from '@/hooks/use-admin';
import { usePagination } from '@/hooks/use-pagination';
import { ProjectStatus } from '@repo/types';
const STATUS_OPTIONS = Object.values(ProjectStatus);
export default function AdminProjectsPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading } = useProjects(params);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteAdminProject();
  const projects = data?.data ?? [];
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const handleStatusChange = (id: string, next: ProjectStatus) => {
    updateProject.mutate(
      { id, dto: { status: next } },
      {
        onSuccess: () => toast.success('Project status updated'),
        onError: () => toast.error('Invalid status transition'),
      },
    );
  };
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (status !== 'ALL' && p.status !== status) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.customerId.toLowerCase().includes(q)
      );
    });
  }, [projects, query, status]);
  const columns = buildProjectsColumns({
    onStatusChange: handleStatusChange,
    onDeleteRequest: (p) => setDeleteTarget({ id: p.id, title: p.title }),
  });
  return (
    <AppPage width="full" className="space-y-4">
      <PageHeader
        title="Projects"
        description="Review and manage all customer projects"
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(p) => p.id}
        isLoading={isLoading}
        toolbar={
          <>
            <Input
              placeholder="Search title or customer…"
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
      {!isLoading && projects.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete project"
        description={`Delete "${deleteTarget?.title}" permanently? This cannot be undone.`}
        confirmLabel="Delete project"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          const id = deleteTarget.id;
          setDeleteTarget(null);
          deleteProject.mutate(id, {
            onSuccess: () => toast.success('Project deleted'),
            onError: () => toast.error('Could not delete project'),
          });
        }}
      />
    </AppPage>
  );
}
