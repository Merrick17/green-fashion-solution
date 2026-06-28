export interface BriefScoreInput {
  title?: string;
  description?: string;
  season?: string | null;
  category?: string | null;
  budgetBand?: string | null;
  moq?: number | null;
  targetDelivery?: string | Date | null;
  garmentCategories?: string[];
  coverImageUrl?: string | null;
}

const SIGNALS: Array<{
  key: keyof BriefScoreInput;
  label: string;
  check: (v: BriefScoreInput) => boolean;
}> = [
  { key: 'title', label: 'Project title', check: (v) => !!v.title?.trim() },
  {
    key: 'description',
    label: 'Brief description (50+ chars)',
    check: (v) => (v.description?.length ?? 0) >= 50,
  },
  { key: 'season', label: 'Season', check: (v) => !!v.season },
  { key: 'category', label: 'Category', check: (v) => !!v.category },
  { key: 'budgetBand', label: 'Budget range', check: (v) => !!v.budgetBand },
  {
    key: 'moq',
    label: 'Minimum order quantity',
    check: (v) => (v.moq ?? 0) > 0,
  },
  {
    key: 'targetDelivery',
    label: 'Target delivery date',
    check: (v) => !!v.targetDelivery,
  },
  {
    key: 'garmentCategories',
    label: 'Garment categories',
    check: (v) => (v.garmentCategories?.length ?? 0) > 0,
  },
  {
    key: 'coverImageUrl',
    label: 'Inspiration image',
    check: (v) => !!v.coverImageUrl,
  },
];

export function briefCompletenessScore(brief: BriefScoreInput): number {
  const passed = SIGNALS.filter((s) => s.check(brief)).length;
  return Math.round((passed / SIGNALS.length) * 100);
}

export function briefMissingFields(brief: BriefScoreInput): string[] {
  return SIGNALS.filter((s) => !s.check(brief)).map((s) => s.label);
}
