import { z } from 'zod';

export const UpdateUserProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty').max(100).optional(),
  image: z.string().url('Image must be a valid URL').nullable().optional(),
});
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

