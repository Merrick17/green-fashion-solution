'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { AppPage } from '@/components/layout';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { EntityList } from '@/components/shared/entity-list';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
import { RouteError } from '@/components/shared/route-error';
import { InspirationAssetCard } from '@/components/customer/inspiration-asset-card';
import { useInspiration, useToggleInspiration } from '@/hooks/use-inspiration';
import { useActiveProject } from '@/hooks/use-active-project';
import { useProjects } from '@/hooks/use-projects';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { InspirationAction } from '@repo/types';
import { StatusBadge } from '@/components/shared/status-badge';
import { Image as ImageIcon } from 'lucide-react';
function InspirationProjectPicker() {
  const { setProjectId } = useActiveProject();
  const { data, isLoading, isError, refetch } = useProjects({
    page: 1,
    limit: 100,
  });
  const projects = data?.data ?? [];
  const router = useRouter();
  if (isLoading) return <RouteSkeleton variant="list" />;
  if (isError) return <RouteError reset={() => void refetch()} />;
  return (
    <AppPage width="wide">
      <header className="border border-portal-border border-l-[3px] border-l-portal-accent bg-portal-surface px-7 py-7 sm:px-8 mb-8 text-center">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Project selection</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-portal-foreground">
          Inspiration vault
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground leading-relaxed">
          Choose a project to browse and curate inspiration assets for your
          upcoming collection.
        </p>
      </header>
      <EntityList
        items={projects}
        emptyTitle="No projects yet"
        emptyDescription="Create a project to browse inspiration assets."
        emptyActionLabel="New project"
        emptyActionHref="/customer/projects/new"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        renderItem={(project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => {
              setProjectId(project.id);
              router.push(`/customer/inspiration?projectId=${project.id}`);
            }}
            className="group border border-portal-border bg-portal-surface relative flex min-h-[12rem] flex-col justify-between overflow-hidden p-6 text-left transition-all"
          >
            <div className="absolute right-0 top-0 p-6 opacity-10 transition-opacity group-hover:opacity-20">
              <ImageIcon className="h-20 w-20 text-portal-accent" />
            </div>
            <div className="relative z-10 space-y-3">
              <StatusBadge status={project.status} />
              <h3 className="font-serif text-2xl font-medium tracking-tight text-portal-foreground transition-colors group-hover:text-portal-accent">
                {project.title}
              </h3>
            </div>
          </button>
        )}
      />
    </AppPage>
  );
}
export function InspirationContent() {
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get('projectId');
  const { projectId: activeProjectId, setProjectId } = useActiveProject();
  const projectId = urlProjectId ?? activeProjectId ?? '';
  const { setPage, params } = usePagination(24);
  const { data, isLoading, isError, refetch } = useInspiration(projectId, params);
  const toggle = useToggleInspiration();
  const assets = data?.data ?? [];
  useEffect(() => {
    if (urlProjectId && urlProjectId !== activeProjectId) {
      setProjectId(urlProjectId);
    }
  }, [urlProjectId, activeProjectId, setProjectId]);
  if (!projectId) {
    return <InspirationProjectPicker />;
  }
  if (isLoading) return <RouteSkeleton variant="masonry" />;
  if (isError) return <RouteError reset={() => void refetch()} />;
  const selectedCount = assets.filter((a) =>
    a.selections.some((s) => s.action === InspirationAction.SELECTED),
  ).length;
  return (
    <AppPage width="full" className="relative bg-portal-main">
      <header className="sticky top-0 z-40 shrink-0 border-b border-portal-border bg-portal-surface px-6 py-4">
        <Breadcrumb
          items={[
            { label: 'Projects', href: '/customer/projects' },
            { label: 'Inspiration' },
          ]}
        />
        <div className="mt-2 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-[length:var(--text-display-sm)] leading-[var(--leading-heading)] tracking-[var(--tracking-display)] tracking-tight">
              Inspiration
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse, save, and select for your proposal
            </p>
          </div>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              {selectedCount} selected
            </div>
          )}
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <EntityList
          items={assets}
          isLoading={false}
          loadingVariant="card"
          emptyTitle="No inspiration assets"
          emptyDescription="Your sourcing team will curate assets for this project."
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          renderItem={(asset) => {
            const handleToggle = (action: InspirationAction) => {
              toggle.mutate({
                projectId,
                action,
                ...(asset.type === 'fabric'
                  ? { fabricAssetId: asset.id }
                  : { productAssetId: asset.id }),
              });
            };
            return (
              <InspirationAssetCard
                key={`${asset.type}-${asset.id}`}
                asset={asset}
                onToggle={handleToggle}
              />
            );
          }}
        />
        {assets.length > 0 && (
          <PaginationControls
            meta={data?.meta}
            onPageChange={setPage}
            className="mt-8"
          />
        )}
      </div>
    </AppPage>
  );
}
