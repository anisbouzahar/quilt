import { z } from 'zod';

export const SignUpWithEmailSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type SignUpWithEmailInput = z.infer<typeof SignUpWithEmailSchema>;

export const SignInWithEmailSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type SignInWithEmailInput = z.infer<typeof SignInWithEmailSchema>;

export const AuthSessionSchema = z.object({
  session: z.object({
    id: z.string(),
    userId: z.string(),
    expiresAt: z.coerce.date(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    activeOrganizationId: z.string().nullish(),
  }),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    emailVerified: z.boolean(),
    image: z.string().nullish(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
});
export type AuthSession = z.infer<typeof AuthSessionSchema>;
