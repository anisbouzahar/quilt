const test = require('node:test');
const assert = require('node:assert/strict');
const storeModule = import('../src/state/create-app-store.ts');
const session = {
  user: {
    id: 'person-a',
    name: 'Alex',
    email: 'alex@example.com',
    emailVerified: true,
  },
  session: { id: 'session-a' },
};
const household = { id: 'home-a', name: 'Our place' };
function fakeClient(overrides = {}) {
  return {
    auth: {
      getSession: async () => session,
      signIn: async () => ({ status: 'authenticated', session }),
      register: async (input) => ({
        status: 'verification-required',
        email: input.email,
      }),
      resendVerification: async () => {},
      verifyEmail: async () => {},
      signOut: async () => {},
      subscribe: () => () => {},
      ...overrides.auth,
    },
    households: {
      list: async () => [household],
      create: async (name) => ({ ...household, name }),
      ...overrides.households,
    },
  };
}

test('restoration and sign-out keep session and household state together', async () => {
  const { createAppStore } = await storeModule;
  const store = createAppStore(fakeClient());
  await store.getState().refreshSession();
  await store.getState().loadHouseholds();
  assert.equal(store.getState().session, session);
  assert.deepEqual(store.getState().households, [household]);
  store.getState().setAppearance('dark');
  await store.getState().signOut();
  assert.equal(store.getState().session, null);
  assert.deepEqual(store.getState().households, []);
  assert.equal(store.getState().appearance, 'dark');
});

test('a stale session response cannot sign someone back in after sign-out', async () => {
  const { createAppStore } = await storeModule;
  let resolveSession;
  const store = createAppStore(
    fakeClient({
      auth: {
        getSession: () =>
          new Promise((resolve) => {
            resolveSession = resolve;
          }),
      },
    }),
  );
  const restoring = store.getState().refreshSession();
  await store.getState().signOut();
  resolveSession(session);
  await restoring;
  assert.equal(store.getState().session, null);
  assert.equal(store.getState().sessionStatus, 'ready');
  assert.deepEqual(store.getState().households, []);
});

test('rejected credentials leave the app signed out and release loading state', async () => {
  const { createAppStore } = await storeModule;
  const store = createAppStore(
    fakeClient({
      auth: {
        signIn: async () => {
          throw new Error('Invalid credentials');
        },
      },
    }),
  );
  await assert.rejects(
    store.getState().signIn({ email: 'alex@example.com', password: 'wrong' }),
  );
  assert.equal(store.getState().session, null);
  assert.equal(store.getState().authPending, false);
});

test('households requested by a previous user cannot populate a later session', async () => {
  const { createAppStore } = await storeModule;
  let resolveList;
  const store = createAppStore(
    fakeClient({
      households: {
        list: () =>
          new Promise((resolve) => {
            resolveList = resolve;
          }),
      },
    }),
  );
  await store
    .getState()
    .signIn({ email: 'alex@example.com', password: 'password' });
  const loading = store.getState().loadHouseholds();
  await store.getState().signOut();
  resolveList([household]);
  await loading;
  assert.deepEqual(store.getState().households, []);
});

test('failed sign-out keeps the existing session available for a retry', async () => {
  const { createAppStore } = await storeModule;
  const store = createAppStore(
    fakeClient({
      auth: {
        signOut: async () => {
          throw new Error('Offline');
        },
      },
    }),
  );
  await store
    .getState()
    .signIn({ email: 'alex@example.com', password: 'password' });
  await assert.rejects(store.getState().signOut());
  assert.equal(store.getState().session, session);
  assert.equal(store.getState().authPending, false);
});

test('registration waits for verification and never loads a household', async () => {
  const { createAppStore } = await storeModule;
  let lists = 0;
  const store = createAppStore(
    fakeClient({
      households: {
        list: async () => {
          lists++;
          return [];
        },
      },
    }),
  );
  const outcome = await store.getState().register({
    name: 'Alex',
    email: 'alex@example.com',
    password: 'password',
  });
  assert.equal(outcome.status, 'verification-required');
  assert.equal(store.getState().session, null);
  assert.equal(store.getState().verificationEmail, 'alex@example.com');
  assert.equal(lists, 0);
});

test('restored unverified sessions cannot expose household data', async () => {
  const { createAppStore } = await storeModule;
  const store = createAppStore(
    fakeClient({
      auth: {
        getSession: async () => ({
          ...session,
          user: { ...session.user, emailVerified: false },
        }),
      },
    }),
  );
  await store.getState().refreshSession();
  assert.equal(store.getState().session, null);
  assert.equal(store.getState().verificationEmail, session.user.email);
  assert.deepEqual(store.getState().households, []);
});

test('resends share a cooldown and verification does not manufacture a session', async () => {
  const { createAppStore } = await storeModule;
  let sends = 0;
  const store = createAppStore(
    fakeClient({
      auth: {
        resendVerification: async () => {
          sends++;
        },
      },
    }),
  );
  await store.getState().resendVerification('alex@example.com');
  await store.getState().resendVerification('alex@example.com');
  assert.equal(sends, 1);
  assert.equal(store.getState().verificationStatus, 'sent');
  await store.getState().verifyEmail('test-token');
  assert.equal(store.getState().verificationStatus, 'verified');
  assert.equal(store.getState().session, null);
});

test('invalid verification links surface a recoverable error', async () => {
  const { createAppStore } = await storeModule;
  const store = createAppStore(
    fakeClient({
      auth: {
        verifyEmail: async () => {
          throw new Error('expired');
        },
      },
    }),
  );
  await store.getState().verifyEmail('expired-token');
  assert.equal(store.getState().verificationStatus, 'error');
  assert.match(store.getState().verificationError, /expired/);
  assert.equal(store.getState().session, null);
});
