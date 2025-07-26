import { z } from 'zod';

export const signUpSchema = z
  .object({
    username: z
      .string({ required_error: 'Username is required' })
      .min(3, { message: 'Username must be at least 3 characters' })
      .max(20, { message: 'Username must be at most 20 characters' }),

    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email format' }),

    password: z
      .string({ required_error: 'Password is required' })
      .min(6, { message: 'Password must be at least 6 characters' })
      .max(40, { message: 'Password must be at most 40 characters' }),

    confirmPassword: z.string({
      required_error: 'Please confirm your password',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

// TypeScript type (optional)
export type signUpInputsType = z.infer<typeof signUpSchema>;
