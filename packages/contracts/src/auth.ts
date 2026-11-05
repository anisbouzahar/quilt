import { z } from 'zod';

export const SignUpWithEmailSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type SignUpWithEmailInput = z.infer<typeof SignUpWithEmailSchema>;

export const SignInWithEmailSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type SignInWithEmailInput = z.infer<typeof SignInWithEmailSchema>;

