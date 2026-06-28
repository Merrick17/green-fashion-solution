'use client';
import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const SEASONS = ['SS25', 'AW25', 'SS26', 'AW26', 'Resort 2026', 'SS27'];

export interface AssetSourcingFormValues {
  description: string;
  keywords: string;
  composition: string;
  color: string;
  supplier: string;
  moq: string;
  leadTimeDays: string;
  pricePerUnitMillimes: string;
  seasons: string[];
}

export const EMPTY_SOURCING: AssetSourcingFormValues = {
  description: '',
  keywords: '',
  composition: '',
  color: '',
  supplier: '',
  moq: '',
  leadTimeDays: '',
  pricePerUnitMillimes: '',
  seasons: [],
};

interface AssetMetadataFormProps {
  values: AssetSourcingFormValues;
  onChange: (values: AssetSourcingFormValues) => void;
  disabled?: boolean;
  keywordPlaceholder?: string;
}

export function AssetMetadataForm({
  values,
  onChange,
  disabled,
  keywordPlaceholder,
}: AssetMetadataFormProps) {
  const baseId = useId();
  const set = (key: keyof AssetSourcingFormValues, v: string) =>
    onChange({ ...values, [key]: v });

  return (
    <div className="space-y-4">
      <Field id={`${baseId}-description`} label="Description">
        <Textarea
          id={`${baseId}-description`}
          value={values.description}
          disabled={disabled}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Composition, hand-feel, weight, supplier notes…"
          rows={3}
        />
      </Field>
      <Field id={`${baseId}-keywords`} label="Keywords">
        <Input
          id={`${baseId}-keywords`}
          value={values.keywords}
          disabled={disabled}
          onChange={(e) => set('keywords', e.target.value)}
          placeholder={
            keywordPlaceholder ?? 'linen, organic, ss25 (comma-separated)'
          }
        />
      </Field>
      <div className="space-y-2">
        <Label>Seasons</Label>
        <div className="flex flex-wrap gap-2">
          {SEASONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => {
                const next = values.seasons.includes(s)
                  ? values.seasons.filter((x) => x !== s)
                  : [...values.seasons, s];
                onChange({ ...values, seasons: next });
              }}
              className={cn(
                'px-2.5 py-1 text-xs font-medium border transition',
                values.seasons.includes(s)
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-transparent text-muted-foreground border-border hover:border-foreground',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${baseId}-composition`} label="Composition">
          <Input
            id={`${baseId}-composition`}
            value={values.composition}
            disabled={disabled}
            onChange={(e) => set('composition', e.target.value)}
            placeholder="100% cotton"
          />
        </Field>
        <Field id={`${baseId}-color`} label="Color">
          <Input
            id={`${baseId}-color`}
            value={values.color}
            disabled={disabled}
            onChange={(e) => set('color', e.target.value)}
            placeholder="Natural"
          />
        </Field>
        <Field id={`${baseId}-supplier`} label="Supplier">
          <Input
            id={`${baseId}-supplier`}
            value={values.supplier}
            disabled={disabled}
            onChange={(e) => set('supplier', e.target.value)}
            placeholder="Supplier name"
          />
        </Field>
        <Field id={`${baseId}-moq`} label="MOQ (units)">
          <Input
            id={`${baseId}-moq`}
            type="number"
            min={0}
            value={values.moq}
            disabled={disabled}
            onChange={(e) => set('moq', e.target.value)}
            placeholder="250"
          />
        </Field>
        <Field id={`${baseId}-lead-time`} label="Lead time (days)">
          <Input
            id={`${baseId}-lead-time`}
            type="number"
            min={0}
            value={values.leadTimeDays}
            disabled={disabled}
            onChange={(e) => set('leadTimeDays', e.target.value)}
            placeholder="21"
          />
        </Field>
        <Field id={`${baseId}-price`} label="Price / unit (millimes)">
          <Input
            id={`${baseId}-price`}
            type="number"
            min={0}
            value={values.pricePerUnitMillimes}
            disabled={disabled}
            onChange={(e) => set('pricePerUnitMillimes', e.target.value)}
            placeholder="12000"
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
