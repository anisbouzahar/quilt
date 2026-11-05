const test = require('node:test');
const assert = require('node:assert/strict');
const storeModule = import('../src/state/create-app-store.ts');
const session = {
  user: { id: 'person-a', name: 'Alex', email: 'alex@example.com' },
  session: { id: 'session-a' },
};
const household = { id: 'home-a', name: 'Our place' };
function fakeClient(overrides = {}) {
  return {
    auth: {
      getSession: async () => session,
      signIn: async () => session,
      register: async () => session,
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
