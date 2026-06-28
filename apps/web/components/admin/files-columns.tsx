import Link from 'next/link';
import {
  FileCog,
  FileText,
  Image as ImageIcon,
  Link2,
  type LucideIcon,
} from 'lucide-react';
import { RowActions } from '@/components/admin/row-actions';
import { titleCase } from '@/components/admin/label';
import type { DataTableColumn } from '@/components/shared/data-table';
import { FileType, type AdminFile } from '@repo/types';
import { formatDate } from '@repo/utils';
const TYPE_ICON: Record<FileType, LucideIcon> = {
  [FileType.IMAGE]: ImageIcon,
  [FileType.PDF]: FileText,
  [FileType.TECHNICAL_SHEET]: FileCog,
  [FileType.REFERENCE]: Link2,
}; /** Derive a readable filename from a stored file URL. */
export function fileLabel(url: string): string {
  const seg = url.split('/').pop();
  if (!seg) return 'File';
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}
interface FilesColumnsHandlers {
  onDownload: (url: string) => void;
  onDeleteRequest: (file: AdminFile) => void;
} /** * Column definitions for the admin files DataTable. The Name cell shows a * file-type icon plus the URL-derived filename; Project links to the project * detail. FileRecord has no size field — a Size column is intentionally omitted * (backend gap: add `size` to the File model + selection if needed). */
export function buildFilesColumns({
  onDownload,
  onDeleteRequest,
}: FilesColumnsHandlers): DataTableColumn<AdminFile>[] {
  return [
    {
      key: 'url',
      header: 'Name',
      sortable: true,
      render: (f) => {
        const Icon = TYPE_ICON[f.type] ?? FileText;
        return (
          <span className="inline-flex items-center gap-2 truncate">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{fileLabel(f.url)}</span>
          </span>
        );
      },
    },
    {
      key: 'project',
      header: 'Project',
      render: (f) => (
        <Link
          href={`/admin/projects/${f.project.id}`}
          className="text-foreground hover:underline"
        >
          {f.project.title}
        </Link>
      ),
    },
    {
      key: 'version',
      header: 'Version',
      sortable: true,
      render: (f) => (
        <span className="text-muted-foreground">v{f.version}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (f) => titleCase(f.type),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      render: (f) => (
        <span className="text-muted-foreground">{formatDate(f.updatedAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (f) => (
        <RowActions
          items={[
            { label: 'Download', onSelect: () => onDownload(f.url) },
            {
              label: 'Delete',
              destructive: true,
              onSelect: () => onDeleteRequest(f),
            },
          ]}
        />
      ),
    },
  ];
}
