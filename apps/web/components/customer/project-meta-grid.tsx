import type { Project } from '@repo/types';
import { formatDate, formatBudgetRange } from '@repo/utils';
import { Banknote, Calendar, Layers, Package } from 'lucide-react';

type MetaItem = {
  icon: typeof Layers;
  label: string;
  value: string;
};

function buildMeta(project: Project): MetaItem[] {
  const items: MetaItem[] = [];
  if (project.season) {
    items.push({ icon: Calendar, label: 'Season', value: project.season });
  }
  if (project.category) {
    items.push({ icon: Layers, label: 'Category', value: project.category });
  }
  if (project.budgetBand) {
    items.push({
      icon: Banknote,
      label: 'Budget',
      value: formatBudgetRange(project.budgetBand),
    });
  }
  if (project.moq) {
    items.push({
      icon: Package,
      label: 'MOQ',
      value: `${project.moq} units`,
    });
  }
  if (project.targetDelivery) {
    items.push({
      icon: Calendar,
      label: 'Delivery',
      value: formatDate(project.targetDelivery),
    });
  }
  return items;
}

export function ProjectMetaGrid({ project }: { project: Project }) {
  const items = buildMeta(project);
  if (items.length === 0) return null;

  return (
    <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-start gap-3 border border-portal-border bg-portal-surface-muted p-4"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-portal-accent-soft text-portal-accent">
            <item.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-relaxed">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-portal-foreground">
              {item.value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
