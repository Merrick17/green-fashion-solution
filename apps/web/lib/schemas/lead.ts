import { z } from 'zod';
import { BudgetRange, ProjectType } from '@repo/types';

export const leadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  email: z.string().email('Enter a valid email address'),
  projectType: z.nativeEnum(ProjectType),
  budgetRange: z.nativeEnum(BudgetRange),
  accepted: z.boolean().refine((value) => value === true, {
    message: 'You must accept the terms and privacy policy',
  }),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
