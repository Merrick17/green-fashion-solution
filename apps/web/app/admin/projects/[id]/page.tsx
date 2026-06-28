'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AppPage } from '@/components/layout';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { PageHeader } from '@/components/shared/page-header';
import { SectionCard } from '@/components/shared/section-card';
import { RouteSkeleton } from '@/components/shared/route-skeleton';
import { ProjectLifecycleTimeline } from '@/components/shared/project-lifecycle-timeline';
import { BriefQaThread } from '@/components/shared/brief-qa-thread';
import { SamplingTimeline } from '@/components/admin/sampling-timeline';
import { useProject, useUpdateProject } from '@/hooks/use-projects';
import { useMilestones } from '@/hooks/use-milestones';
import { useProjectAgentContext } from '@/hooks/use-project-agent-context';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { EntityTimestamps } from '@/components/shared/entity-timestamps';
import { ProjectStatus } from '@repo/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
const STATUS_OPTIONS = Object.values(ProjectStatus);
export default function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: project, isLoading } = useProject(id);
  const { data: milestonesData } = useMilestones(id, { page: 1, limit: 50 });
  const { data: agentCtx } = useProjectAgentContext(id);
  const updateProject = useUpdateProject();
  const [qaOpen, setQaOpen] = useState(false);
  if (isLoading) return <RouteSkeleton variant="detail" />;
  if (!project) return <AppPage width="full"><p>Not found</p></AppPage>;
  const milestones = milestonesData?.data ?? [];
  const firstMoodboard = agentCtx?.moodboards?.[0];
  const handleStatusChange = (status: ProjectStatus) => {
    updateProject.mutate(
      { id, dto: { status } },
      {
        onSuccess: () => toast.success('Project status updated'),
        onError: () => toast.error('Invalid status transition'),
      },
    );
  };
  return (
    <AppPage width="full">
      <Breadcrumb
        items={[
          { label: 'Projects', href: '/admin/projects' },
          { label: project.title },
        ]}
      />
      <PageHeader
        title={project.title}
        description={project.description}
        actions={<StatusBadge status={project.status} />}
      />
      <SectionCard title="Lifecycle">
        <ProjectLifecycleTimeline
          status={project.status}
          milestones={milestones}
        />
      </SectionCard>
      <SectionCard title="Sampling milestones">
        <SamplingTimeline milestones={milestones} />
      </SectionCard>
      <SectionCard title="Actions">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={project.status}
            onValueChange={(v) => handleStatusChange(v as ProjectStatus)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/tasks/assign?projectId=${id}`}>
              Assign Brief
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/proposals/new?projectId=${id}`}>
              Build Proposal
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/meetings">Meetings</Link>
          </Button>
        </div>
      </SectionCard>
      {firstMoodboard && (
        <SectionCard title="Customer Vision">
          <div className="space-y-4">
            {firstMoodboard.styleDirection && (
              <blockquote className="border-l-2 border-[--portal-accent] pl-4 text-sm italic text-portal-foreground">
                {firstMoodboard.styleDirection}
              </blockquote>
            )}
            {firstMoodboard.mood && (
              <div>
                <span className="inline-block bg-portal-surface-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  {firstMoodboard.mood}
                </span>
              </div>
            )}
            {firstMoodboard.colorPalette.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {firstMoodboard.colorPalette.map((color) => (
                  <span
                    key={color}
                    className="inline-block border border-portal-border px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {color}
                  </span>
                ))}
              </div>
            )}
            {firstMoodboard.fabricSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {firstMoodboard.fabricSuggestions.map((f) => (
                  <span
                    key={f}
                    className="inline-block bg-portal-surface border border-portal-border px-2.5 py-1 text-xs font-mono text-portal-muted"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      )}
      <SectionCard title="Record">
        <EntityTimestamps
          createdAt={project.createdAt}
          updatedAt={project.updatedAt}
        />
      </SectionCard>
      <div className="border border-border">
        <button
          type="button"
          onClick={() => setQaOpen((o) => !o)}
          className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors"
        >
          <span>Brief Q&amp;A</span>
          {qaOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {qaOpen && (
          <BriefQaThread projectId={id} />
        )}
      </div>
    </AppPage>
  );
}
