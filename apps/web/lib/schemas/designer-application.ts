import { z } from 'zod';

export const designerApplicationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
  portfolioUrl: z.union([
    z.literal(''),
    z.string().url('Enter a valid URL'),
  ]),
  experience: z.string().optional(),
  message: z.string().optional(),
});

export type DesignerApplicationFormValues = z.infer<
  typeof designerApplicationSchema
>;
