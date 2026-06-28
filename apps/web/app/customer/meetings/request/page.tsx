'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppPage } from '@/components/layout';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { WorkspaceHeader } from '@/components/design-system/workspace-header';
import { useProjects } from '@/hooks/use-projects';
import { useCreateMeeting } from '@/hooks/use-meetings';
import { useActiveProject } from '@/hooks/use-active-project';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
const dropdownParams = { page: 1, limit: 100 };
const STEPS = ['Collection', 'Duration', 'Notes'] as const;
const DURATION_OPTIONS = [
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
];
export default function RequestMeetingPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId: urlProjectId } = use(searchParams);
  const router = useRouter();
  const { data: projectsData } = useProjects(dropdownParams);
  const { projectId: activeProjectId, setProjectId } = useActiveProject();
  const createMeeting = useCreateMeeting();
  const [step, setStep] = useState(0);
  const [projectId, setLocalProjectId] = useState(
    urlProjectId ?? activeProjectId ?? '',
  );
  const [agenda, setAgenda] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const projects = projectsData?.data ?? [];
  useEffect(() => {
    const preferred = urlProjectId ?? activeProjectId;
    if (preferred) setLocalProjectId(preferred);
  }, [urlProjectId, activeProjectId]);
  const handleSubmit = () => {
    createMeeting.mutate(
      {
        projectId,
        requestedAt: new Date().toISOString(),
        agenda: agenda.trim() || undefined,
        durationMinutes: Number(durationMinutes),
      },
      {
        onSuccess: () => {
          setProjectId(projectId);
          router.push('/customer/calendar');
        },
      },
    );
  };
  return (
    <AppPage width="narrow">
      <Breadcrumb
        items={[
          { label: 'Calendar', href: '/customer/calendar' },
          { label: 'Schedule review' },
        ]}
      />
      <WorkspaceHeader
        title="Schedule a review"
        phase="Request time with your sourcing team"
        className="mt-4"
      />
      <div className="mt-8 flex gap-2" role="tablist" aria-label="Meeting request steps">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={step === i}
            aria-controls={`meeting-step-${i}`}
            onClick={() => setStep(i)}
            className={cn(
              'flex-1 border-b-2 pb-2 text-xs font-medium uppercase tracking-wider',
              step === i
                ? 'border-brand-accent text-foreground'
                : 'border-transparent text-muted-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-8 space-y-6">
        {step === 0 && (
          <div id="meeting-step-0" className="space-y-2" role="tabpanel">
            <Label htmlFor="meeting-project">Collection</Label>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Create a collection first before scheduling a review.
              </p>
            ) : (
            <Select
              value={projectId}
              onValueChange={(value) => {
                setLocalProjectId(value);
                setProjectId(value);
              }}
            >
              <SelectTrigger id="meeting-project">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            )}
          </div>
        )}
        {step === 1 && (
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={durationMinutes} onValueChange={setDurationMinutes}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Proposal review, fabric selection, sampling timeline…"
              rows={4}
            />
          </div>
        )}
        <div className="flex gap-2">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              variant="brand"
              className="flex-1"
              disabled={step === 0 && !projectId}
              onClick={() => setStep(step + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="brand"
              className="flex-1"
              disabled={!projectId || createMeeting.isPending}
              onClick={handleSubmit}
            >
              {createMeeting.isPending ? 'Submitting…' : 'Submit request'}
            </Button>
          )}
        </div>
      </div>
    </AppPage>
  );
}
