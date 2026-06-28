import { Palette, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@repo/utils';
import {
  BRIEF_FIELD_LABELS,
  BUDGET_BAND_OPTIONS,
  type BriefWizardForm,
} from './brief-options';
interface BriefStepReferencesProps {
  form: BriefWizardForm;
  onCreate: () => void;
  isCreating?: boolean;
}
function budgetLabel(value: string) {
  return BUDGET_BAND_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
export function BriefStepReferences({
  form,
  onCreate,
  isCreating,
}: BriefStepReferencesProps) {
  const summary = [
    { label: BRIEF_FIELD_LABELS.title, value: form.title },
    { label: BRIEF_FIELD_LABELS.season, value: form.season },
    { label: BRIEF_FIELD_LABELS.category, value: form.category },
    {
      label: BRIEF_FIELD_LABELS.budgetBand,
      value: budgetLabel(form.budgetBand),
    },
    {
      label: BRIEF_FIELD_LABELS.moq,
      value: form.moq ? `${form.moq} units` : '',
    },
    {
      label: BRIEF_FIELD_LABELS.targetDelivery,
      value: form.targetDelivery ? formatDate(form.targetDelivery) : '',
    },
  ];
  return (
    <div className="space-y-6">
      <div className=" bg-muted/80 p-5">
        <h3 className="text-sm font-semibold text-foreground">Brief summary</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {summary.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-0.5 text-sm text-foreground">{value || '—'}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {form.description}
        </p>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          After you create the project
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex gap-3 border border-dashed border-border p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary/10 text-primary">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Moodboard</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Co-design visual direction with design assist
              </p>
            </div>
          </div>
          <div className="flex gap-3 border border-dashed border-border p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-secondary text-muted-foreground">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">File uploads</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Attach tech packs and reference PDFs on the project page
              </p>
            </div>
          </div>
        </div>
      </div>
      <Button
        type="button"
        className="w-full sm:w-auto"
        onClick={onCreate}
        disabled={isCreating}
      >
        {isCreating ? 'Creating project…' : 'Create project'}
      </Button>
    </div>
  );
}
