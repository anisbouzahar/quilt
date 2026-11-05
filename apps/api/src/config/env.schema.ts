import { z } from 'zod';

export const EnvSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    CORS_ORIGINS: z.string().default('http://localhost:8081'),
    DATABASE_URL: z.string({
      error: 'DATABASE_URL is required',
    }),
    REDIS_URL: z.string().optional(),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
    BETTER_AUTH_URL: z.url().default('http://localhost:3000'),
    BETTER_AUTH_SECRET: z
      .string({
        error: 'BETTER_AUTH_SECRET is required',
      })
      .min(16, 'BETTER_AUTH_SECRET must be at least 16 characters'),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
  })
  .transform((env) => ({
    ...env,
    REDIS_URL:
      env.REDIS_URL && env.REDIS_URL.trim().length > 0
        ? env.REDIS_URL
        : `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`,
    CORS_ORIGIN_LIST: env.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  }));

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = EnvSchema.safeParse(config);
  if (!result.success) {
    const errorMessages = result.error.issues.map(
      (issue) => `  - ${issue.path.join('.')}: ${issue.message}`,
    );
    throw new Error(
      `\n❌ Invalid environment variables at startup:\n${errorMessages.join('\n')}\n\nPlease check your .env configuration.\n`,
    );
  }
  return result.data;
}
