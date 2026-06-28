import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/shared/skeleton';
import { useBriefCategories, useBriefSeasons } from '@/hooks/use-brief-options';
import { type BriefWizardForm } from './brief-options';
import { BriefFormField } from './brief-form-field';

interface BriefStepBasicsProps {
  form: BriefWizardForm;
  onChange: (patch: Partial<BriefWizardForm>) => void;
  errors?: Partial<Record<keyof BriefWizardForm, string>>;
}

export function BriefStepBasics({
  form,
  onChange,
  errors = {},
}: BriefStepBasicsProps) {
  const { data: seasons = [], isLoading: seasonsLoading } = useBriefSeasons();
  const { data: categories = [], isLoading: categoriesLoading } =
    useBriefCategories();
  return (
    <div className="space-y-6">
      <BriefFormField label="Project title" htmlFor="brief-title" required>
        <Input
          id="brief-title"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Spring knitwear capsule"
          autoComplete="off"
          required
          aria-required="true"
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </BriefFormField>
      <div className="grid gap-6 sm:grid-cols-2">
        <BriefFormField
          label="Season"
          htmlFor="brief-season"
          required
          hint="Target collection season or drop"
        >
          {seasonsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <>
              <Select
                value={form.season}
                onValueChange={(season) => onChange({ season })}
                required
              >
                <SelectTrigger id="brief-season" aria-required="true">
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.label}>
                      {season.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.season && (
                <p className="text-sm text-destructive">{errors.season}</p>
              )}
            </>
          )}
        </BriefFormField>
        <BriefFormField
          label="Category"
          htmlFor="brief-category"
          required
          hint="Primary product focus"
        >
          {categoriesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <>
              <Select
                value={form.category}
                onValueChange={(category) => onChange({ category })}
                required
              >
                <SelectTrigger id="brief-category" aria-required="true">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.label}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </>
          )}
        </BriefFormField>
      </div>
      <BriefFormField
        label="Creative brief"
        htmlFor="brief-description"
        required
        hint="Silhouettes, materials, quality tier, and sourcing goals for your team"
      >
        <Textarea
          id="brief-description"
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe the collection direction, target customer, and any non-negotiables…"
          rows={6}
          required
          aria-required="true"
          aria-invalid={!!errors.description}
          className="min-h-[140px] resize-y"
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
      </BriefFormField>
    </div>
  );
}
