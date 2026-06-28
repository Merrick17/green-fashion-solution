import Link from 'next/link';
import { Check, Palette, Send, FilePlus2 } from 'lucide-react';
import type { Project } from '@repo/types';
import { ProjectStatus } from '@repo/types';
import { cn } from '@/lib/utils';
type Step = {
  key: string;
  label: string;
  description: string;
  href: string;
  icon: typeof FilePlus2;
  done: boolean;
};
function buildSteps(
  projects: Project[],
  activeProjectId?: string | null,
  hasMoodboard = false,
): Step[] {
  const draft =
    projects.find((p) => p.status === ProjectStatus.DRAFT) ?? projects[0];
  const projectId = activeProjectId ?? draft?.id;
  const hasBrief = projects.some(
    (p) => p.status !== ProjectStatus.DRAFT || Boolean(p.season && p.category),
  );
  const briefHref = draft
    ? `/customer/projects/${draft.id}`
    : '/customer/projects/new';
  const moodboardHref = projectId
    ? `/customer/moodboard/create?projectId=${projectId}`
    : '/customer/moodboard';
  const submitHref = draft
    ? `/customer/projects/${draft.id}`
    : '/customer/projects/new';
  return [
    {
      key: 'brief',
      label: 'Submit brief',
      description: 'Define season, category, and collection goals',
      href: briefHref,
      icon: FilePlus2,
      done: hasBrief,
    },
    {
      key: 'moodboard',
      label: 'Moodboard',
      description: 'Co-design visual direction with AI',
      href: moodboardHref,
      icon: Palette,
      done: hasMoodboard,
    },
    {
      key: 'submit',
      label: 'Submit to team',
      description: 'Send your brief for sourcing review',
      href: submitHref,
      icon: Send,
      done: projects.some((p) => p.status !== ProjectStatus.DRAFT),
    },
  ];
}
export function OnboardingChecklist({
  projects,
  activeProjectId,
  hasMoodboard = false,
}: {
  projects: Project[];
  activeProjectId?: string | null;
  hasMoodboard?: boolean;
}) {
  const steps = buildSteps(projects, activeProjectId, hasMoodboard);
  const completed = steps.filter((s) => s.done).length;
  return (
    <section className="border border-portal-border bg-portal-surface p-8 lg:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Getting started</p>
          <h2 className="mt-2 font-serif text-2xl tracking-tight text-portal-foreground">
            Launch your first collection
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground leading-relaxed">
            Complete these steps to hand off to your sourcing team.
          </p>
        </div>
        <span className="bg-portal-accent-soft px-3 py-1.5 text-xs font-semibold text-portal-accent">
          {completed}/{steps.length} complete
        </span>
      </div>
      <ol className="mt-8 grid gap-6 lg:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.key}>
            <Link
              href={step.href}
              className={cn(
                'flex h-full flex-col gap-4 border p-6 transition-all',
                step.done
                  ? 'border-portal-accent/30 bg-portal-accent-soft'
                  : 'border-portal-border bg-portal-surface hover:border-portal-accent/20',
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center',
                    step.done
                      ? 'bg-portal-accent text-portal-accent-foreground'
                      : 'bg-portal-surface-muted text-portal-muted',
                  )}
                >
                  <step.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground leading-relaxed">
                  Step {index + 1}
                </span>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium text-portal-foreground">
                  {step.label}
                  {step.done && (
                    <Check className="h-3.5 w-3.5 text-portal-accent" />
                  )}
                </p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
