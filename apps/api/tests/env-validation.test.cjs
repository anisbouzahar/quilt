const test = require('node:test');
const assert = require('node:assert/strict');
const { validateEnv } = require('../dist/config/env.schema.js');

test('validateEnv accepts valid environment and generates computed fields', () => {
  const env = validateEnv({
    DATABASE_URL: 'postgresql://quilt:quilt@localhost:5432/quilt',
    BETTER_AUTH_SECRET: 'test-secret-at-least-16-characters-long',
    PORT: '4000',
    CORS_ORIGINS: 'http://localhost:8081, http://localhost:3000',
    REDIS_HOST: '127.0.0.1',
    REDIS_PORT: '6380',
  });

  assert.equal(env.PORT, 4000);
  assert.equal(env.REDIS_URL, 'redis://127.0.0.1:6380');
  assert.deepEqual(env.CORS_ORIGIN_LIST, [
    'http://localhost:8081',
    'http://localhost:3000',
  ]);
  assert.equal(
    env.DATABASE_URL,
    'postgresql://quilt:quilt@localhost:5432/quilt',
  );
  assert.equal(
    env.BETTER_AUTH_SECRET,
    'test-secret-at-least-16-characters-long',
  );
});

test('validateEnv throws on missing required DATABASE_URL', () => {
  assert.throws(
    () => {
      validateEnv({
        PORT: 3000,
        BETTER_AUTH_SECRET: 'test-secret-at-least-16-characters-long',
      });
    },
    (err) => {
      assert.ok(err instanceof Error);
      assert.match(err.message, /DATABASE_URL: DATABASE_URL is required/);
      return true;
    },
  );
});

test('validateEnv throws on missing required BETTER_AUTH_SECRET', () => {
  assert.throws(
    () => {
      validateEnv({
        DATABASE_URL: 'postgresql://quilt:quilt@localhost:5432/quilt',
        PORT: 3000,
      });
    },
    (err) => {
      assert.ok(err instanceof Error);
      assert.match(
        err.message,
        /BETTER_AUTH_SECRET: BETTER_AUTH_SECRET is required/,
      );
      return true;
    },
  );
});

test('validateEnv throws on short BETTER_AUTH_SECRET', () => {
  assert.throws(
    () => {
      validateEnv({
        DATABASE_URL: 'postgresql://localhost:5432/db',
        BETTER_AUTH_SECRET: 'too-short',
      });
    },
    (err) => {
      assert.ok(err instanceof Error);
      assert.match(
        err.message,
        /BETTER_AUTH_SECRET must be at least 16 characters/,
      );
      return true;
    },
  );
});

test('validateEnv throws on invalid port number', () => {
  assert.throws(
    () => {
      validateEnv({
        DATABASE_URL: 'postgresql://localhost:5432/db',
        BETTER_AUTH_SECRET: 'test-secret-at-least-16-characters-long',
        PORT: 'not-a-port',
      });
    },
    (err) => {
      assert.ok(err instanceof Error);
      assert.match(err.message, /PORT/);
      return true;
    },
  );
});
