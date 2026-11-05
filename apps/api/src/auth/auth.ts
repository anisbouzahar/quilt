import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import type { Database } from '@quilt/db';
import { schema } from '@quilt/db';
import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';

export interface AuthConfigOptions {
  baseURL?: string;
  secret?: string;
  githubClientId?: string;
  githubClientSecret?: string;
  googleClientId?: string;
  googleClientSecret?: string;
}

export function createAuth(db: Database, options?: AuthConfigOptions) {
  const baseURL =
    options?.baseURL || process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  const secret =
    options?.secret ||
    process.env.BETTER_AUTH_SECRET ||
    'quilt-development-secret-must-be-changed-in-production-1234567890';

  const socialProviders: Record<
    string,
    { clientId: string; clientSecret: string }
  > = {};

  const githubClientId =
    options?.githubClientId || process.env.GITHUB_CLIENT_ID;
  const githubClientSecret =
    options?.githubClientSecret || process.env.GITHUB_CLIENT_SECRET;
  if (githubClientId && githubClientSecret) {
    socialProviders.github = {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    };
  }

  const googleClientId =
    options?.googleClientId || process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret =
    options?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;
  if (googleClientId && googleClientSecret) {
    socialProviders.google = {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    };
  }

  return betterAuth({
    baseURL,
    basePath: '/api/auth',
    secret,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders:
      Object.keys(socialProviders).length > 0 ? socialProviders : undefined,
    plugins: [organization()],
  });
}

export type AuthInstance = ReturnType<typeof createAuth>;
