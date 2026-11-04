import { z } from 'zod';

export const signUpSchema = z
  .object({
    username: z
      .string({ required_error: 'v.usernameMin' })
      .min(3, { message: 'v.usernameMin' })
      .max(20, { message: 'v.usernameMax' }),

    email: z
      .string({ required_error: 'v.emailRequired' })
      .email({ message: 'v.emailInvalid' }),

    password: z
      .string({ required_error: 'v.passwordRequired' })
      .min(6, { message: 'v.passwordMin' })
      .max(40, { message: 'v.passwordMax' }),

    confirmPassword: z.string({
      required_error: 'v.confirmRequired',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'v.passwordsDiffer',
  });

// TypeScript type (optional)
export type signUpInputsType = z.infer<typeof signUpSchema>;
