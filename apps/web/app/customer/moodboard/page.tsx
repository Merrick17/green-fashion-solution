'use client';
import Link from 'next/link';
import { AppPage } from '@/components/layout';
import { PageHeader } from '@/components/shared/page-header';
import { EntityList } from '@/components/shared/entity-list';
import { useProjects } from '@/hooks/use-projects';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { useMoodboards } from '@/hooks/use-moodboards';
export default function CustomerMoodboardPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading } = useProjects(params);
  const projects = data?.data ?? [];
  return (
    <AppPage>
      <PageHeader
        title="Vibe Design Canvas"
        description="Select a project to view or create an AI-powered moodboard"
      />
      <EntityList
        items={projects}
        isLoading={isLoading}
        loadingVariant="rows"
        emptyTitle="No projects yet"
        emptyDescription="Create a project first to develop your moodboard."
        emptyActionLabel="Create a project"
        emptyActionHref="/customer/projects/new"
        className="sm:grid-cols-2"
        renderItem={(p) => (
          <MoodboardCard key={p.id} projectId={p.id} title={p.title} />
        )}
      />
      {!isLoading && projects.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
    </AppPage>
  );
}
function MoodboardCard({
  projectId,
  title,
}: {
  projectId: string;
  title: string;
}) {
  const { data } = useMoodboards(projectId);
  const moodboards = data?.data ?? [];
  const latest = moodboards[0];
  return (
    <div className="border border-border bg-card p-4 transition-colors hover:bg-secondary/50">
      <h3 className="font-medium">{title}</h3>
      {latest ? (
        <Link
          href={`/customer/moodboard/${latest.id}`}
          className="mt-1 inline-block text-sm text-primary hover:underline"
        >
          Open moodboard →
        </Link>
      ) : (
        <Link
          href={`/customer/moodboard/create?projectId=${projectId}`}
          className="mt-1 inline-block text-sm text-muted-foreground hover:underline"
        >
          Create moodboard →
        </Link>
      )}
    </div>
  );
}
