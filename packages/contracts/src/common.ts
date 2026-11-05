import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export interface ValidationErrorIssue {
  path: (string | number)[];
  message: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: ValidationErrorIssue[];
  timestamp?: string;
  path?: string;
}

export interface HealthResponse {
  status: 'ok';
  service: 'quilt-api';
}
