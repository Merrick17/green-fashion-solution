'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { buildFilesColumns, fileLabel } from '@/components/admin/files-columns';
import { titleCase } from '@/components/admin/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminFiles, useDeleteAdminFile } from '@/hooks/use-admin';
import { usePagination } from '@/hooks/use-pagination';
import { FileType } from '@repo/types';
const TYPE_OPTIONS = Object.values(FileType);
export default function AdminFilesPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading } = useAdminFiles(params);
  const deleteFile = useDeleteAdminFile();
  const files = data?.data ?? [];
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string>('ALL');
  const filtered = files.filter((f) => {
    if (type !== 'ALL' && f.type !== type) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [fileLabel(f.url), f.type, f.project.title].some((s) =>
      s.toLowerCase().includes(q),
    );
  });
  const columns = buildFilesColumns({
    onDownload: (url) => window.open(url, '_blank', 'noopener,noreferrer'),
    onDeleteRequest: (f) =>
      setDeleteTarget({ id: f.id, label: fileLabel(f.url) }),
  });
  return (
    <AppPage width="full" className="space-y-4">
      <PageHeader
        title="Files"
        description="All project uploads across the platform"
      />
      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(f) => f.id}
        isLoading={isLoading}
        toolbar={
          <>
            <Input
              placeholder="Search name, type, project…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-56"
            />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-8 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {titleCase(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />
      {!isLoading && files.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete file"
        description={`Delete "${deleteTarget?.label}" permanently? This cannot be undone.`}
        confirmLabel="Delete file"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          const id = deleteTarget.id;
          setDeleteTarget(null);
          deleteFile.mutate(id, {
            onSuccess: () => toast.success('File deleted'),
            onError: () => toast.error('Could not delete file'),
          });
        }}
      />
    </AppPage>
  );
}
