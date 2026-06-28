import { z } from 'zod';

export const waitlistSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  email: z.string().email('Enter a valid work email'),
});

export type WaitlistFormValues = z.infer<typeof waitlistSchema>;
