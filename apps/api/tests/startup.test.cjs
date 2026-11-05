const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { createServer } = require('node:net');
const { resolve } = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

test(
  'the compiled API entry boots and serves health',
  { timeout: 15000 },
  async () => {
    const reservation = createServer();
    reservation.listen(0, '127.0.0.1');
    await once(reservation, 'listening');
    const port = reservation.address().port;
    await new Promise((done) => reservation.close(done));
    const child = spawn(
      process.execPath,
      [resolve(__dirname, '../dist/main.js')],
      {
        cwd: resolve(__dirname, '..'),
        env: {
          ...process.env,
          PORT: String(port),
          DATABASE_URL: 'postgresql://unused:unused@127.0.0.1:1/unused',
          BETTER_AUTH_SECRET: 'test-only-startup-secret-at-least-32-characters',
          NODE_ENV: 'test',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    let output = '';
    child.stdout.on('data', (data) => {
      output = (output + data).slice(-3000);
    });
    child.stderr.on('data', (data) => {
      output = (output + data).slice(-3000);
    });
    try {
      let response;
      for (let attempt = 0; attempt < 80; attempt++) {
        if (child.exitCode !== null) break;
        try {
          response = await fetch(`http://127.0.0.1:${port}/api/health`, {
            signal: AbortSignal.timeout(500),
          });
          if (response.ok) break;
        } catch {
          /* Wait for startup, bounded by this test's timeout. */
        }
        await delay(100);
      }
      assert.ok(response?.ok, `Compiled API failed to start:\n${output}`);
      assert.deepEqual(await response.json(), {
        status: 'ok',
        service: 'quilt-api',
      });
    } finally {
      if (child.exitCode === null) {
        child.kill('SIGTERM');
        await once(child, 'exit');
      }
    }
  },
);
