import { z } from 'zod';

const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'v.emailRequired' })
    .email({ message: 'v.emailInvalid' }),
  password: z.string().min(1, { message: 'v.passwordRequired' }),
});

type signInType = z.infer<typeof signInSchema>;

export { signInSchema, type signInType };
