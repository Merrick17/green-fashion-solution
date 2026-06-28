import { Tag } from '@/components/shared/tag';
import { RowActions } from '@/components/admin/row-actions';
import { titleCase } from '@/components/admin/label';
import type { DataTableColumn } from '@/components/shared/data-table';
import { LeadStatus, type Lead } from '@repo/types';
import { formatDate } from '@repo/utils';
interface LeadsColumnsHandlers {
  onToggle: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
} /** * Column definitions for the admin leads DataTable. The actions cell surfaces * the lead status as a Tag plus a "Mark contacted / new" toggle and a * delete-with-confirm (ConfirmDialog owned by the page). */
export function buildLeadsColumns({
  onToggle,
  onDelete,
}: LeadsColumnsHandlers): DataTableColumn<Lead>[] {
  return [
    {
      key: 'brand',
      header: 'Brand',
      sortable: true,
      render: (l) => <span className="font-medium">{l.brand}</span>,
    },
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (l) => <span className="text-muted-foreground">{l.email}</span>,
    },
    {
      key: 'projectType',
      header: 'Project Type',
      sortable: true,
      render: (l) => titleCase(l.projectType),
    },
    {
      key: 'budgetRange',
      header: 'Budget',
      sortable: true,
      render: (l) => titleCase(l.budgetRange),
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      render: (l) => (
        <span className="text-muted-foreground">{formatDate(l.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (l) => (
        <div className="flex items-center justify-end gap-2">
          <Tag
            tone={
              l.status === LeadStatus.CONTACTED
                ? 'success'
                : l.status === LeadStatus.CONVERTED
                  ? 'accent'
                  : 'neutral'
            }
          >
            {titleCase(l.status)}
          </Tag>
          {/* TODO: "Convert to project" — no lead->project endpoint yet; add when createProjectFromLead exists. */}
          <RowActions
            items={[
              {
                label:
                  l.status === LeadStatus.CONTACTED
                    ? 'Mark as new'
                    : 'Mark contacted',
                onSelect: () => onToggle(l),
              },
              {
                label: 'Delete',
                destructive: true,
                onSelect: () => onDelete(l),
              },
            ]}
          />
        </div>
      ),
    },
  ];
}
