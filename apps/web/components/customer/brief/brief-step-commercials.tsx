import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BUDGET_BAND_OPTIONS, type BriefWizardForm } from './brief-options';
import { BriefFormField } from './brief-form-field';

interface BriefStepCommercialsProps {
  form: BriefWizardForm;
  onChange: (patch: Partial<BriefWizardForm>) => void;
  errors?: Partial<Record<keyof BriefWizardForm, string>>;
}

export function BriefStepCommercials({
  form,
  onChange,
  errors = {},
}: BriefStepCommercialsProps) {
  return (
    <div className="space-y-6">
      <BriefFormField
        label="Budget band"
        htmlFor="brief-budget"
        required
        hint="Approximate sourcing and development budget for this collection"
      >
        <Select
          value={form.budgetBand}
          onValueChange={(budgetBand) => onChange({ budgetBand })}
          required
        >
          <SelectTrigger id="brief-budget" aria-required="true">
            <SelectValue placeholder="Select budget range" />
          </SelectTrigger>
          <SelectContent>
            {BUDGET_BAND_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.budgetBand && (
          <p className="text-sm text-destructive">{errors.budgetBand}</p>
        )}
      </BriefFormField>
      <div className="grid gap-6 sm:grid-cols-2">
        <BriefFormField
          label="Minimum order quantity (MOQ)"
          htmlFor="brief-moq"
          required
        >
          <Input
            id="brief-moq"
            type="number"
            min={1}
            inputMode="numeric"
            value={form.moq}
            onChange={(e) => onChange({ moq: e.target.value })}
            placeholder="500"
            required
            aria-required="true"
            aria-invalid={!!errors.moq}
          />
          {errors.moq && (
            <p className="text-sm text-destructive">{errors.moq}</p>
          )}
        </BriefFormField>
        <BriefFormField
          label="Target delivery date"
          htmlFor="brief-delivery"
          required
        >
          <Input
            id="brief-delivery"
            type="date"
            value={form.targetDelivery}
            onChange={(e) => onChange({ targetDelivery: e.target.value })}
            required
            aria-required="true"
            aria-invalid={!!errors.targetDelivery}
          />
          {errors.targetDelivery && (
            <p className="text-sm text-destructive">{errors.targetDelivery}</p>
          )}
        </BriefFormField>
      </div>
      <p className="border border-portal-border bg-portal-accent-soft px-4 py-3 text-sm leading-relaxed text-muted-foreground leading-relaxed">
        Commercial details help our sourcing team scope factories, sampling
        rounds, and production timelines before your first proposal.
      </p>
    </div>
  );
}
