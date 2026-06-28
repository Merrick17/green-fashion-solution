'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProject } from '@/hooks/use-projects';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { briefCompletenessScore } from '@repo/utils';
import {
  EMPTY_BRIEF_FORM,
  briefFormToDto,
  getBriefValidationErrors,
  isStepValid,
  type BriefWizardForm,
} from './brief-options';
import { BriefStepBasics } from './brief-step-basics';
import { BriefStepCommercials } from './brief-step-commercials';

export function BriefWizard() {
  const router = useRouter();
  const createProject = useCreateProject();
  const [form, setForm] = useState<BriefWizardForm>(EMPTY_BRIEF_FORM);
  const [showErrors, setShowErrors] = useState(false);
  const patchForm = (patch: Partial<BriefWizardForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };
  const isFormValid = isStepValid(1, form) && isStepValid(2, form);
  const errors = showErrors ? getBriefValidationErrors(form) : {};
  const score = briefCompletenessScore({
    title: form.title,
    description: form.description,
    season: form.season || null,
    category: form.category || null,
    budgetBand: form.budgetBand || null,
    moq: form.moq ? Number(form.moq) : null,
    targetDelivery: form.targetDelivery || null,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setShowErrors(true);
      return;
    }
    createProject.mutate(briefFormToDto(form), {
      onSuccess: (project) => {
        toast.success(
          'Brief submitted! Your sourcing team will deliver a proposal within 3–5 business days.',
        );
        router.push(`/customer/projects/${project.id}?tab=overview`);
      },
      onError: () => toast.error('Could not create project'),
    });
  };

  return (
    <form onSubmit={handleCreate} className="border border-portal-border bg-portal-surface mb-8">
      <div
        className="h-0.5 bg-[--portal-accent] transition-all"
        style={{ width: `${score}%` }}
        aria-label={`Brief completeness: ${score}%`}
      />
      <div className="space-y-12 px-6 py-8 lg:px-10 lg:py-10">
        <section>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Step 1</p>
          <h2 className="mt-2 font-serif text-2xl tracking-tight text-portal-foreground">
            Basic information
          </h2>
          <div className="mt-8">
            <BriefStepBasics form={form} onChange={patchForm} errors={errors} />
          </div>
        </section>

        <hr className="border-portal-border" />

        <section>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Step 2</p>
          <h2 className="mt-2 font-serif text-2xl tracking-tight text-portal-foreground">
            Commercial details
          </h2>
          <div className="mt-8">
            <BriefStepCommercials
              form={form}
              onChange={patchForm}
              errors={errors}
            />
          </div>
          {score < 60 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Add more detail to improve sourcing accuracy
            </p>
          )}
        </section>

        {showErrors && !isFormValid && (
          <p className="text-sm text-destructive" role="alert">
            Please complete all required fields before creating your project.
          </p>
        )}

        <div className="flex flex-col gap-4 border-t border-portal-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Fields marked with <span className="text-destructive">*</span> are
            required.
          </p>
          <Button
            type="submit"
            variant="brand"
            size="lg"
            disabled={createProject.isPending}
            className="w-full sm:w-auto"
          >
            {createProject.isPending ? 'Creating project…' : 'Create project'}
          </Button>
        </div>
      </div>
    </form>
  );
}
