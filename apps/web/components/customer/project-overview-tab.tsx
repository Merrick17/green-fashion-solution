'use client';

import { toast } from 'sonner';
import type { Milestone, Project } from '@repo/types';
import { ProjectStatus } from '@repo/types';
import { formatDate, isBriefReadyToSubmit } from '@repo/utils';
import { BriefCompletenessMeter } from '@/components/customer/brief/brief-completeness-meter';
import { ProjectFilesPanel } from '@/components/customer/project-files-panel';
import { ProjectMetaGrid } from '@/components/customer/project-meta-grid';
import { ProjectLifecycleTimeline } from '@/components/shared/project-lifecycle-timeline';
import { useSubmitProject } from '@/hooks/use-submit-project';
import { Button } from '@/components/ui/button';

type ProjectOverviewTabProps = {
  project: Project;
  milestones: Milestone[];
};

export function ProjectOverviewTab({
  project,
  milestones,
}: ProjectOverviewTabProps) {
  const submitProject = useSubmitProject();
  const canSubmit =
    project.status === ProjectStatus.DRAFT &&
    !project.briefSubmittedAt &&
    isBriefReadyToSubmit(project);

  const handleSubmit = () => {
    submitProject.mutate(project.id, {
      onSuccess: () => toast.success('Brief submitted to sourcing team'),
      onError: () => toast.error('Could not submit brief'),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="border border-portal-border bg-portal-surface p-6 lg:p-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Collection brief</p>
        <h2 className="mt-2 font-serif text-xl text-portal-foreground">
          Brief readiness
        </h2>
        <div className="mt-6">
          <BriefCompletenessMeter project={project} />
        </div>
        <div className="mt-8">
          <ProjectMetaGrid project={project} />
        </div>
        {project.briefSubmittedAt ? (
          <p className="mt-8 text-sm text-muted-foreground leading-relaxed">
            Submitted {formatDate(project.briefSubmittedAt)}
          </p>
        ) : (
          <Button
            variant="brand"
            size="lg"
            className="mt-8"
            onClick={handleSubmit}
            disabled={!canSubmit || submitProject.isPending}
          >
            {submitProject.isPending
              ? 'Submitting…'
              : 'Submit to sourcing team'}
          </Button>
        )}
      </section>

      <section className="border border-portal-border bg-portal-surface p-6 lg:p-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Progress</p>
        <h2 className="mt-2 font-serif text-xl text-portal-foreground">
          Lifecycle
        </h2>
        <div className="mt-6">
          <ProjectLifecycleTimeline
            status={project.status}
            milestones={milestones}
          />
        </div>
      </section>

      <ProjectFilesPanel projectId={project.id} />
    </div>
  );
}
