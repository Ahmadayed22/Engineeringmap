import { z } from 'zod';

export const materialSchema = z
  .object({
    // name is required, must be a non-empty string
    name: z.string().min(1, 'Name is required').max(50),

    // all possible materials (only one will be active at a time, but required)
    books: z.string().url('Invalid URL').optional(),
    summaries: z.string().url('Invalid URL').optional(),
    slides: z.string().url('Invalid URL').optional(),
    labs: z.string().url('Invalid URL').optional(),
    exams: z.string().url('Invalid URL').optional(),
    videos: z.string().url('Invalid URL').optional(),
  })
  .refine(
    (data) => {
      // require that at least one of the resource fields is filled
      return (
        data.books ||
        data.summaries ||
        data.slides ||
        data.labs ||
        data.exams ||
        data.videos
      );
    },
    {
      message: 'URL link is required',
      path: ['_url'], // artificial path to show error in form
    }
  );

export type FormData = z.infer<typeof materialSchema>;
