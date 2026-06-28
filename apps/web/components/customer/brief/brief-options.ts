import { BudgetRange } from '@repo/types';

export const BUDGET_BAND_OPTIONS = [
  { value: BudgetRange.UNDER_10K, label: 'Under $10K' },
  { value: BudgetRange.RANGE_10K_25K, label: '$10K – $25K' },
  { value: BudgetRange.RANGE_25K_50K, label: '$25K – $50K' },
  { value: BudgetRange.RANGE_50K_100K, label: '$50K – $100K' },
  { value: BudgetRange.OVER_100K, label: 'Over $100K' },
] as const;

export const BRIEF_FIELD_LABELS: Record<string, string> = {
  title: 'Project title',
  description: 'Description',
  season: 'Season',
  category: 'Category',
  budgetBand: 'Budget band',
  moq: 'MOQ',
  targetDelivery: 'Target delivery',
};

export type BriefWizardForm = {
  title: string;
  description: string;
  season: string;
  category: string;
  budgetBand: string;
  moq: string;
  targetDelivery: string;
};

export const EMPTY_BRIEF_FORM: BriefWizardForm = {
  title: '',
  description: '',
  season: '',
  category: '',
  budgetBand: '',
  moq: '',
  targetDelivery: '',
};

export function briefFormToDto(form: BriefWizardForm) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    season: form.season || undefined,
    category: form.category || undefined,
    budgetBand: form.budgetBand || undefined,
    targetDelivery: form.targetDelivery || undefined,
    moq: form.moq ? Number(form.moq) : undefined,
  };
}

export function isStepValid(step: number, form: BriefWizardForm): boolean {
  if (step === 1) {
    return (
      form.title.trim().length > 0 &&
      form.description.trim().length > 0 &&
      !!form.season &&
      !!form.category
    );
  }
  if (step === 2) {
    return (
      !!form.budgetBand &&
      !!form.moq &&
      Number(form.moq) > 0 &&
      !!form.targetDelivery
    );
  }
  return true;
}

export function getBriefValidationErrors(
  form: BriefWizardForm,
): Partial<Record<keyof BriefWizardForm, string>> {
  const errors: Partial<Record<keyof BriefWizardForm, string>> = {};
  if (!form.title.trim()) errors.title = 'Project title is required';
  if (!form.description.trim())
    errors.description = 'Creative brief is required';
  if (!form.season) errors.season = 'Season is required';
  if (!form.category) errors.category = 'Category is required';
  if (!form.budgetBand) errors.budgetBand = 'Budget band is required';
  if (!form.moq || Number(form.moq) <= 0)
    errors.moq = 'Enter a valid minimum order quantity';
  if (!form.targetDelivery)
    errors.targetDelivery = 'Target delivery date is required';
  return errors;
}
