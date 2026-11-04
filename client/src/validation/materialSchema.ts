import { z } from 'zod';

export const materialSchema = z
  .object({
    // name is required, must be a non-empty string
    name: z.string().min(1, 'v.nameRequired').max(50, 'v.nameMax'),

    // all possible materials (only one will be active at a time, but required)
    books: z
      .string()
      .url('v.urlInvalid')
      .regex(/^https?:\/\//i, 'v.urlInvalid')
      .optional(),
    summaries: z
      .string()
      .url('v.urlInvalid')
      .regex(/^https?:\/\//i, 'v.urlInvalid')
      .optional(),
    slides: z
      .string()
      .url('v.urlInvalid')
      .regex(/^https?:\/\//i, 'v.urlInvalid')
      .optional(),
    labs: z
      .string()
      .url('v.urlInvalid')
      .regex(/^https?:\/\//i, 'v.urlInvalid')
      .optional(),
    exams: z
      .string()
      .url('v.urlInvalid')
      .regex(/^https?:\/\//i, 'v.urlInvalid')
      .optional(),
    videos: z
      .string()
      .url('v.urlInvalid')
      .regex(/^https?:\/\//i, 'v.urlInvalid')
      .optional(),
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
      message: 'v.urlRequired',
      path: ['_url'], // artificial path to show error in form
    }
  );

export type FormData = z.infer<typeof materialSchema>;
