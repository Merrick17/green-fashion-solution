'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Plus, Shirt } from 'lucide-react';
import { DashboardHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { RouteError } from '@/components/shared/route-error';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
import { useTasks } from '@/hooks/use-tasks';
import { TaskStatus } from '@repo/types';
import { DesignerActiveRequests } from './designer-active-requests';
import { DesignerCompletedRequests } from './designer-completed-requests';
import { VisualCard } from '@/components/design-system/visual-card';

const statsParams = { page: 1, limit: 100 };

export default function DesignerDashboardPage() {
  const {
    data: tasksData,
    isLoading,
    isError,
    refetch,
  } = useTasks(statsParams);

  useEffect(() => {
    document.title = 'Archive — Green Designer';
  }, []);

  const tasks = tasksData?.data ?? [];
  const activeBriefs = tasks.filter(
    (t) =>
      t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS,
  );
  const completedBriefs = tasks.filter(
    (t) => t.status === TaskStatus.COMPLETED,
  );

  if (isLoading) return <RouteSkeleton variant="dashboard" />;

  if (isError) return <RouteError reset={() => void refetch()} />;

  return (
    <div className="mx-auto flex w-full max-w-[var(--content-wide)] min-h-0 flex-1 flex-col gap-10 pb-8">
      <DashboardHeader
        title="Sourcing archive"
        phase="Contribute fabrics, references, and collections"
        showGreeting
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="brandOutline" size="lg">
              <Link href="/designer/assets/fabrics/upload">
                <Shirt className="h-4 w-4" /> Upload fabric
              </Link>
            </Button>
            <Button asChild variant="brand" size="lg">
              <Link href="/designer/assets/products/upload">
                <Plus className="h-4 w-4" /> New reference
              </Link>
            </Button>
          </div>
        }
      />

      <DesignerActiveRequests briefs={activeBriefs} />

      <section className="flex flex-col gap-5">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-portal-foreground">Archive</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <VisualCard
            href="/designer/assets/fabrics"
            title="Fabrics"
            subtitle="Browse and upload fabric swatches"
            aspect="landscape"
          />
          <VisualCard
            href="/designer/assets/products"
            title="Product references"
            subtitle="Garment and product references"
            aspect="landscape"
          />
          <VisualCard
            href="/designer/collections"
            title="Collections"
            subtitle="Organize assets into collections"
            aspect="landscape"
          />
        </div>
      </section>

      <DesignerCompletedRequests briefs={completedBriefs} />
    </div>
  );
}
