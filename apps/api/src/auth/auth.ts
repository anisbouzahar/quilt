import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { expo } from '@better-auth/expo';
import type { Database } from '@quilt/db';
import { schema } from '@quilt/db';
import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';
import type { RedisService } from '../redis/redis.service';

export interface AuthConfigOptions {
  baseURL?: string;
  secret: string;
  trustedOrigins?: string[];
  githubClientId?: string;
  githubClientSecret?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  redisService?: RedisService;
}

export function createAuth(db: Database, options: AuthConfigOptions) {
  const baseURL =
    options.baseURL || process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  const secret = options.secret || process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is required');
  }

  const socialProviders: Record<
    string,
    { clientId: string; clientSecret: string }
  > = {};

  const githubClientId = options.githubClientId || process.env.GITHUB_CLIENT_ID;
  const githubClientSecret =
    options.githubClientSecret || process.env.GITHUB_CLIENT_SECRET;
  if (githubClientId && githubClientSecret) {
    socialProviders.github = {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    };
  }

  const googleClientId = options.googleClientId || process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret =
    options.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;
  if (googleClientId && googleClientSecret) {
    socialProviders.google = {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    };
  }

  const secondaryStorage = options.redisService
    ? {
        get: (key: string) => options.redisService!.get(key),
        set: (key: string, value: string, ttl?: number) =>
          options.redisService!.set(key, value, ttl),
        delete: (key: string) => options.redisService!.del(key),
        getAndDelete: (key: string) => options.redisService!.getAndDelete(key),
        increment: (key: string, ttl?: number) =>
          options.redisService!.increment(key, ttl),
      }
    : undefined;

  return betterAuth({
    baseURL,
    basePath: '/api/auth',
    secret,
    trustedOrigins: [...(options.trustedOrigins ?? []), 'quilt://'],
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders:
      Object.keys(socialProviders).length > 0 ? socialProviders : undefined,
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    rateLimit: {
      enabled: true,
      storage: secondaryStorage ? 'secondary-storage' : 'memory',
    },
    secondaryStorage,
    plugins: [organization(), expo()],
  });
}

export type AuthInstance = ReturnType<typeof createAuth>;
