'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AppPage, PageHeader } from '@/components/layout';
import { EntityList } from '@/components/shared/entity-list';
import { ProjectListCard } from '@/components/customer/project-list-card';
import { useProjects } from '@/hooks/use-projects';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { Button } from '@/components/ui/button';

export default function CustomerProjectsPage() {
  const { setPage, params } = usePagination(20);
  const { data, isLoading, isError, refetch } = useProjects(params);
  const projects = data?.data ?? [];

  useEffect(() => {
    document.title = 'Workspaces — Green';
  }, []);

  return (
    <AppPage variant="dashboard" width="wide">
      <PageHeader
        title="Your projects"
        description="Manage briefs, inspiration, and proposals for each collection"
        actions={
          <Button asChild variant="brand" size="lg">
            <Link href="/customer/projects/new">
              <Plus className="h-4 w-4" /> New project
            </Link>
          </Button>
        }
      />

      <EntityList
        items={projects}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingVariant="card"
        emptyTitle="No projects yet"
        emptyDescription="Start a new sourcing project to connect with our team."
        emptyActionLabel="New project"
        emptyActionHref="/customer/projects/new"
        className="grid gap-6"
        renderItem={(project) => (
          <ProjectListCard key={project.id} project={project} />
        )}
      />

      {!isLoading && projects.length > 0 && (
        <PaginationControls meta={data?.meta} onPageChange={setPage} />
      )}
    </AppPage>
  );
}
