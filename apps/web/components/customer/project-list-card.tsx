import Link from 'next/link';
import { Calendar, Layers, Package, Banknote, ArrowRight } from 'lucide-react';
import type { Project } from '@repo/types';
import { StatusBadge } from '@/components/shared/status-badge';
import { DashboardWorkflowRail } from '@/components/customer/dashboard/dashboard-workflow-rail';
import { formatDate, formatBudgetRange } from '@repo/utils';

type Props = { project: Project };

const META_FIELDS = [
  {
    key: 'category' as const,
    icon: Layers,
    label: 'Category',
    getValue: (p: Project) => p.category,
  },
  {
    key: 'moq' as const,
    icon: Package,
    label: 'MOQ',
    getValue: (p: Project) => (p.moq ? `${p.moq} units` : null),
  },
  {
    key: 'budget' as const,
    icon: Banknote,
    label: 'Budget',
    getValue: (p: Project) =>
      p.budgetBand ? formatBudgetRange(p.budgetBand) : null,
  },
  {
    key: 'delivery' as const,
    icon: Calendar,
    label: 'Delivery',
    getValue: (p: Project) =>
      p.targetDelivery ? formatDate(p.targetDelivery) : null,
  },
];

export function ProjectListCard({ project }: Props) {
  const meta = META_FIELDS.map((field) => ({
    ...field,
    value: field.getValue(project),
  })).filter((f) => f.value);

  return (
    <Link
      href={`/customer/projects/${project.id}`}
      className="group border border-portal-border bg-portal-surface block overflow-hidden transition-all"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-portal-surface-muted">
        {project.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-portal-surface-muted to-portal-border">
            <span className="font-serif text-lg text-portal-muted">
              {project.season ?? 'Collection'}
            </span>
          </div>
        )}
        {project.season && (
          <span className="absolute left-4 top-4 bg-portal-surface/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-portal-accent">
            {project.season}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-6 p-6 lg:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="truncate font-serif text-xl tracking-tight text-portal-foreground transition-colors group-hover:text-portal-accent">
              {project.title}
            </h3>
            {project.description && (
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            )}
          </div>
          <StatusBadge status={project.status} className="shrink-0" />
        </div>

        {meta.length > 0 && (
          <div className="grid gap-6 border-t border-portal-border pt-5 sm:grid-cols-2 lg:grid-cols-4">
            {meta.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-2.5 text-sm text-muted-foreground leading-relaxed"
              >
                <item.icon className="h-4 w-4 shrink-0 text-portal-accent" />
                <span className="truncate">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground leading-relaxed">
                    {item.label}
                  </span>
                  <span className="ml-1.5 text-portal-foreground">
                    {item.value}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-portal-border bg-portal-surface-muted px-6 py-4 -mx-6 -mb-6 lg:-mx-7 lg:-mb-7 lg:px-7">
          <DashboardWorkflowRail status={project.status} compact />
          <ArrowRight className="h-4 w-4 shrink-0 text-portal-muted transition-transform group-hover:translate-x-0.5 group-hover:text-portal-accent" />
        </div>
      </div>
    </Link>
  );
}
