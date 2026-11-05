import { z } from 'zod';

export const PasswordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/[0-9]/, 'Password must include at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must include at least one special character',
  );

export const SignUpWithEmailSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.email('Invalid email address'),
  password: PasswordSchema,
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
