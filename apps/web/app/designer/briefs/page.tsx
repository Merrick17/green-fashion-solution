'use client';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { SectionCard } from '@/components/shared/section-card';
import { useTasks, useUpdateTask } from '@/hooks/use-tasks';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { DesignBriefCard } from '@/components/designer/design-brief-card';
import { TaskStatus, BriefType } from '@repo/types';
import { EmptyState } from '@/components/shared/empty-state';
import { RouteError } from '@/components/shared/route-error';
import { Skeleton } from '@/components/shared/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SourcingAgentPanel } from '@/components/ai-assistant/sourcing-agent-panel';
export default function DesignerBriefsPage() {
  const [aiOpen, setAiOpen] = useState(false);
  const { page, setPage, params } = usePagination(12);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const queryParams = {
    ...params,
    ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    sortBy: 'dueDate',
    sortOrder: 'asc' as const,
  };
  const { data, isLoading, isError, refetch } = useTasks(queryParams);
  const updateTask = useUpdateTask();
  const briefs = data?.data ?? [];
  const uploadHrefFor = (briefType: BriefType) => {
    if (
      briefType === BriefType.PRODUCT_REFERENCE ||
      briefType === BriefType.SAMPLE_PREP
    ) {
      return '/designer/assets/products/upload';
    }
    return '/designer/assets/fabrics/upload';
  };
  return (
    <AppPage width="wide">
      <PageHeader
        title="Design Briefs"
        description="Sourcing briefs assigned by your team lead — no customer data exposed"
        actions={
          <Button variant="brandOutline" size="sm" onClick={() => setAiOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" /> Sourcing assist
          </Button>
        }
      />
      <SectionCard
        title="Your briefs"
        description="Filter by status to focus on pending or in-progress work"
      >
        <Tabs
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as TaskStatus | 'ALL');
            setPage(1);
          }}
        >
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value={TaskStatus.PENDING}>Pending</TabsTrigger>
            <TabsTrigger value={TaskStatus.IN_PROGRESS}>
              In progress
            </TabsTrigger>
            <TabsTrigger value={TaskStatus.COMPLETED}>Completed</TabsTrigger>
          </TabsList>
          <TabsContent value={statusFilter} className="mt-4 space-y-3">
            {isError ? (
              <RouteError reset={() => void refetch()} />
            ) : isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : !briefs.length ? (
              <EmptyState
                title="No briefs"
                description="When admin assigns sourcing work, your briefs appear here with deliverables and deadlines."
              />
            ) : (
              briefs.map((brief) => (
                <DesignBriefCard
                  key={brief.id}
                  brief={brief}
                  uploadHref={uploadHrefFor(brief.briefType)}
                  onStart={() =>
                    updateTask.mutate({
                      id: brief.id,
                      dto: { status: TaskStatus.IN_PROGRESS },
                    })
                  }
                  onComplete={() =>
                    updateTask.mutate({
                      id: brief.id,
                      dto: { status: TaskStatus.COMPLETED },
                    })
                  }
                />
              ))
            )}
            <PaginationControls meta={data?.meta} onPageChange={setPage} />
          </TabsContent>
        </Tabs>
      </SectionCard>
      <Sheet open={aiOpen} onOpenChange={setAiOpen}>
        <SheetContent side="right" showCloseButton={false} className="w-full p-0 sm:max-w-md">
          <SheetHeader className="sr-only">
            <SheetTitle>Sourcing assist</SheetTitle>
          </SheetHeader>
          <SourcingAgentPanel onClose={() => setAiOpen(false)} />
        </SheetContent>
      </Sheet>
    </AppPage>
  );
}
