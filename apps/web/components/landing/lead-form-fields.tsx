'use client';

import { ProjectType, BudgetRange } from '@repo/types';
import type { LeadFormValues } from '@/lib/schemas/lead';
import type { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';

const flatField =
  'border-0 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-0';

type LeadFormFieldsProps = {
  form: UseFormReturn<LeadFormValues>;
  onSubmit: (values: LeadFormValues) => void;
  isPending: boolean;
  isError: boolean;
};

export function LeadFormFields({
  form,
  onSubmit,
  isPending,
  isError,
}: LeadFormFieldsProps) {
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5 bg-accent-foreground/10 p-8 sm:p-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input className={flatField} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand *</FormLabel>
              <FormControl>
                <Input className={flatField} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input type="email" className={flatField} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project type *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className={flatField}>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ProjectType).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="budgetRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className={flatField}>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(BudgetRange).map((b) => (
                    <SelectItem key={b} value={b}>
                      {b.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="accepted"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-start gap-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal text-accent-foreground/80">
                I accept the terms and privacy policy
              </FormLabel>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        type="submit"
        size="lg"
        className="h-12 w-full bg-foreground text-background hover:bg-foreground/90"
        disabled={isPending}
      >
        {isPending ? 'Submitting…' : 'Submit request'}
      </Button>
      {isError && (
        <p className="text-sm text-destructive" role="alert">
          Could not submit your request. Please try again.
        </p>
      )}
    </form>
  );
}
