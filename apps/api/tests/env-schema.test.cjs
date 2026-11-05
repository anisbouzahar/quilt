const test = require('node:test');
const assert = require('node:assert/strict');
const { validateEnv } = require('../dist/config/env.schema.js');

test('SMTP booleans parse false correctly and production requires explicit delivery configuration', () => {
  const base = {
    DATABASE_URL: 'postgresql://localhost/quilt',
    BETTER_AUTH_SECRET: 'test-secret-at-least-32-characters-long',
  };
  const local = validateEnv({
    ...base,
    SMTP_SECURE: 'false',
    SMTP_REQUIRE_TLS: 'false',
  });
  assert.equal(local.SMTP_SECURE, false);
  assert.equal(local.SMTP_PORT, 1025);
  assert.equal(local.SMTP_REQUIRE_TLS, false);
  assert.throws(
    () => validateEnv({ ...base, SMTP_USER: 'user' }),
    /SMTP_PASSWORD/,
  );
  assert.throws(
    () => validateEnv({ ...base, NODE_ENV: 'production' }),
    /SMTP_HOST/,
  );
  const prod = validateEnv({
    ...base,
    NODE_ENV: 'production',
    APP_URL: 'https://app.example.com',
    SMTP_HOST: 'smtp.example.com',
    MAIL_FROM: 'hello@example.com',
  });
  assert.equal(prod.SMTP_REQUIRE_TLS, true);
  assert.equal(prod.SMTP_PORT, 587);
});
