import { z } from 'zod';
export const materialSchema = z.object({
  books: z.string().url().optional().or(z.literal('')),
  summaries: z.string().url().optional().or(z.literal('')),
  slides: z.string().url().optional().or(z.literal('')),
  labs: z.string().url().optional().or(z.literal('')),
  exams: z.string().url().optional().or(z.literal('')),
  videos: z.string().url().optional().or(z.literal('')),
});

export type FormData = z.infer<typeof materialSchema>;
