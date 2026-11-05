import { describe, it, expect } from 'vitest';
import { validateEnv } from '../src/config/env.schema';

describe('validateEnv mail configuration', () => {
  it('SMTP booleans parse false correctly and production requires explicit delivery configuration', () => {
    const base = {
      DATABASE_URL: 'postgresql://localhost/quilt',
      BETTER_AUTH_SECRET: 'test-secret-at-least-32-characters-long',
    };
    const local = validateEnv({
      ...base,
      SMTP_SECURE: 'false',
      SMTP_REQUIRE_TLS: 'false',
    });
    expect(local.SMTP_SECURE).toBe(false);
    expect(local.SMTP_PORT).toBe(1025);
    expect(local.SMTP_REQUIRE_TLS).toBe(false);
    expect(() => validateEnv({ ...base, SMTP_USER: 'user' })).toThrow(
      /SMTP_PASSWORD/,
    );
    expect(() => validateEnv({ ...base, NODE_ENV: 'production' })).toThrow(
      /SMTP_HOST/,
    );
    const prod = validateEnv({
      ...base,
      NODE_ENV: 'production',
      APP_URL: 'https://app.example.com',
      SMTP_HOST: 'smtp.example.com',
      MAIL_FROM: 'hello@example.com',
    });
    expect(prod.SMTP_REQUIRE_TLS).toBe(true);
    expect(prod.SMTP_PORT).toBe(587);
  });
});
