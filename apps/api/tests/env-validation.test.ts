import { describe, it, expect } from 'vitest';
import { validateEnv } from '../src/config/env.schema';

describe('validateEnv', () => {
  it('accepts valid environment and generates computed fields', () => {
    const env = validateEnv({
      DATABASE_URL: 'postgresql://quilt:quilt@localhost:5432/quilt',
      BETTER_AUTH_SECRET: 'test-secret-at-least-16-characters-long',
      PORT: '4000',
      CORS_ORIGINS: 'http://localhost:8081, http://localhost:3000',
      REDIS_HOST: '127.0.0.1',
      REDIS_PORT: '6380',
    });

    expect(env.PORT).toBe(4000);
    expect(env.REDIS_URL).toBe('redis://127.0.0.1:6380');
    expect(env.CORS_ORIGIN_LIST).toEqual([
      'http://localhost:8081',
      'http://localhost:3000',
    ]);
    expect(env.DATABASE_URL).toBe(
      'postgresql://quilt:quilt@localhost:5432/quilt',
    );
    expect(env.BETTER_AUTH_SECRET).toBe(
      'test-secret-at-least-16-characters-long',
    );
  });

  it('throws on missing required DATABASE_URL', () => {
    expect(() => {
      validateEnv({
        PORT: 3000,
        BETTER_AUTH_SECRET: 'test-secret-at-least-16-characters-long',
      });
    }).toThrow(/DATABASE_URL: DATABASE_URL is required/);
  });

  it('throws on missing required BETTER_AUTH_SECRET', () => {
    expect(() => {
      validateEnv({
        DATABASE_URL: 'postgresql://quilt:quilt@localhost:5432/quilt',
        PORT: 3000,
      });
    }).toThrow(/BETTER_AUTH_SECRET: BETTER_AUTH_SECRET is required/);
  });

  it('throws on short BETTER_AUTH_SECRET', () => {
    expect(() => {
      validateEnv({
        DATABASE_URL: 'postgresql://quilt:quilt@localhost:5432/quilt',
        BETTER_AUTH_SECRET: 'short',
        PORT: 3000,
      });
    }).toThrow(/BETTER_AUTH_SECRET must be at least 16 characters/);
  });

  it('throws on invalid port number', () => {
    expect(() => {
      validateEnv({
        DATABASE_URL: 'postgresql://quilt:quilt@localhost:5432/quilt',
        BETTER_AUTH_SECRET: 'test-secret-at-least-16-characters-long',
        PORT: 'not-a-number',
      });
    }).toThrow(/PORT: Invalid input/);
  });
});
