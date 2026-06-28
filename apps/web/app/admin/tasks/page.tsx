'use client';
import Link from 'next/link';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { EntityList } from '@/components/shared/entity-list';
import { useTasks, useDeleteTask, useUpdateTask } from '@/hooks/use-tasks';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { AdminEntityRow } from '@/components/admin/admin-entity-row';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { TaskStatus } from '@repo/types';
export default function AdminBriefsListPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading } = useTasks(params);
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const briefs = data?.data ?? [];
  return (
    <AppPage width="full">
      <PageHeader
        title="Design Briefs"
        description="All assigned designer briefs"
        actions={
          <Button asChild size="sm">
            <Link href="/admin/tasks/assign">Assign Brief</Link>
          </Button>
        }
      />
      <EntityList
        items={briefs}
        isLoading={isLoading}
        loadingVariant="rows"
        emptyTitle="No briefs"
        emptyDescription="Assign sourcing work to designers from a project."
        emptyActionLabel="Assign Brief"
        emptyActionHref="/admin/tasks/assign"
        renderItem={(t) => (
          <AdminEntityRow
            key={t.id}
            title={t.title}
            subtitle={t.description ?? `Project ${t.projectId.slice(0, 8)}`}
            createdAt={t.createdAt}
            updatedAt={t.updatedAt}
            extraTimestamps={
              t.dueDate ? [{ label: 'Due', value: t.dueDate }] : undefined
            }
            actions={
              <>
                <StatusBadge status={t.status} />
                {t.status !== TaskStatus.COMPLETED && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateTask.mutate({
                        id: t.id,
                        dto: { status: TaskStatus.COMPLETED },
                      })
                    }
                  >
                    Complete
                  </Button>
                )}
              </>
            }
            onDelete={() => deleteTask.mutate(t.id)}
          />
        )}
      />
      {!isLoading && briefs.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
    </AppPage>
  );
}
