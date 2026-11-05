const test = require('node:test');
const assert = require('node:assert/strict');
const { AuthGuard } = require('../dist/auth/guards/auth.guard.js');

function fixture(session) {
  const request = { headers: {} };
  const guard = new AuthGuard(
    { auth: { api: { getSession: async () => session } } },
    { getAllAndOverride: () => false },
  );
  const context = {
    getHandler: () => {},
    getClass: () => {},
    switchToHttp: () => ({ getRequest: () => request }),
  };
  return { guard, context, request };
}

test('a pre-existing unverified session is refused by protected API endpoints', async () => {
  const { guard, context } = fixture({
    user: { id: 'person', emailVerified: false },
    session: { id: 'old-session' },
  });
  await assert.rejects(
    guard.canActivate(context),
    (error) => error.getStatus() === 403,
  );
});

test('verified sessions populate the request for downstream authorization', async () => {
  const session = {
    user: { id: 'person', emailVerified: true },
    session: { id: 'session' },
  };
  const { guard, context, request } = fixture(session);
  assert.equal(await guard.canActivate(context), true);
  assert.equal(request.user, session.user);
  assert.equal(request.session, session.session);
});
