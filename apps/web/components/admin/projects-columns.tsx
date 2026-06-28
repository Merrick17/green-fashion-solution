import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RowActions } from '@/components/admin/row-actions';
import { titleCase } from '@/components/admin/label';
import type { DataTableColumn } from '@/components/shared/data-table';
import { ProjectStatus, type Project } from '@repo/types';
import { formatDate, briefCompletenessScore } from '@repo/utils';

const STATUS_OPTIONS = Object.values(ProjectStatus);

interface ProjectsColumnsHandlers {
  onStatusChange: (id: string, status: ProjectStatus) => void;
  onDeleteRequest: (project: Project) => void;
}

export function buildProjectsColumns({
  onStatusChange,
  onDeleteRequest,
}: ProjectsColumnsHandlers): DataTableColumn<Project>[] {
  return [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (p) => (
        <Link
          href={`/admin/projects/${p.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {p.title}
        </Link>
      ),
    },
    {
      key: 'customerId',
      header: 'Customer',
      sortable: true,
      render: (p) => (
        <span
          className="font-mono text-xs text-muted-foreground"
          title={p.customerId}
        >
          {p.customerId.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (p) => (
        <Select
          value={p.status}
          onValueChange={(s) => onStatusChange(p.id, s as ProjectStatus)}
        >
          <SelectTrigger className="h-7 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {titleCase(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Brief',
      sortable: false,
      render: (p) => {
        const score = briefCompletenessScore({
          title: p.title,
          description: p.description ?? undefined,
          season: p.season ?? null,
          category: p.category ?? null,
          budgetBand: p.budgetBand ?? null,
          moq: p.moq ?? null,
          targetDelivery: p.targetDelivery ?? null,
          coverImageUrl: p.coverImageUrl ?? null,
        });
        const color =
          score >= 80
            ? 'text-green-600'
            : score >= 50
              ? 'text-amber-500'
              : 'text-red-500';
        return (
          <span className={`font-mono text-xs font-medium tabular-nums ${color}`}>
            {score}%
          </span>
        );
      },
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      render: (p) => (
        <span className="text-muted-foreground">{formatDate(p.updatedAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (p) => (
        <RowActions
          items={[
            { label: 'View', href: `/admin/projects/${p.id}` },
            {
              label: 'Delete',
              destructive: true,
              onSelect: () => onDeleteRequest(p),
            },
          ]}
        />
      ),
    },
  ];
}
