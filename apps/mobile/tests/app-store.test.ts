import { describe, it, expect } from 'vitest';
import { createAppStore } from '../src/state/create-app-store';
import type { Household, Session } from '../src/lib/client';

describe('AppStore', () => {
  const session: Session = {
    user: {
      id: 'person-a',
      name: 'Alex',
      email: 'alex@example.com',
      emailVerified: true,
      createdAt: new Date('2026-11-05T00:00:00.000Z'),
      updatedAt: new Date('2026-11-05T00:00:00.000Z'),
    },
    session: {
      id: 'session-a',
      userId: 'person-a',
      expiresAt: new Date('2026-11-12T00:00:00.000Z'),
      createdAt: new Date('2026-11-05T00:00:00.000Z'),
      updatedAt: new Date('2026-11-05T00:00:00.000Z'),
    },
  };

  const household: Household = {
    id: 'home-a',
    name: 'Our place',
    slug: 'our-place',
    createdAt: new Date('2026-11-05T00:00:00.000Z'),
  };

  function fakeClient(overrides: Record<string, unknown> = {}) {
    const authOverrides = (overrides.auth as Record<string, unknown>) ?? {};
    const householdOverrides =
      (overrides.households as Record<string, unknown>) ?? {};

    return {
      auth: {
        getSession: () => Promise.resolve(session),
        requireSession: () => Promise.resolve(session),
        signIn: () => Promise.resolve({ status: 'authenticated', session }),
        register: (input: { email: string }) =>
          Promise.resolve({
            status: 'verification-required',
            email: input.email,
          }),
        resendVerification: () => Promise.resolve(),
        verifyEmail: () => Promise.resolve(),
        signOut: () => Promise.resolve(),
        subscribe: () => () => {},
        ...authOverrides,
      },
      households: {
        list: () => Promise.resolve([household]),
        create: (name: string) => Promise.resolve({ ...household, name }),
        ...householdOverrides,
      },
    } as Parameters<typeof createAppStore>[0];
  }

  it('restoration and sign-out keep session and household state together', async () => {
    const store = createAppStore(fakeClient());
    await store.getState().refreshSession();
    await store.getState().loadHouseholds();
    expect(store.getState().session).toEqual(session);
    expect(store.getState().households).toEqual([household]);
    store.getState().setAppearance('dark');
    await store.getState().signOut();
    expect(store.getState().session).toBeNull();
    expect(store.getState().households).toEqual([]);
    expect(store.getState().appearance).toBe('dark');
  });

  it('a stale session response cannot sign someone back in after sign-out', async () => {
    let resolveSession!: (s: Session) => void;
    const store = createAppStore(
      fakeClient({
        auth: {
          getSession: () =>
            new Promise<Session>((resolve) => {
              resolveSession = resolve;
            }),
        },
      }),
    );
    const restoring = store.getState().refreshSession();
    await store.getState().signOut();
    resolveSession(session);
    await restoring;
    expect(store.getState().session).toBeNull();
    expect(store.getState().sessionStatus).toBe('ready');
    expect(store.getState().households).toEqual([]);
  });

  it('rejected credentials leave the app signed out and release loading state', async () => {
    const store = createAppStore(
      fakeClient({
        auth: {
          signIn: () => Promise.reject(new Error('Invalid credentials')),
        },
      }),
    );
    await expect(
      store.getState().signIn({ email: 'alex@example.com', password: 'wrong' }),
    ).rejects.toThrow();
    expect(store.getState().session).toBeNull();
    expect(store.getState().authPending).toBe(false);
  });

  it('households requested by a previous user cannot populate a later session', async () => {
    let resolveList!: (h: Household[]) => void;
    const store = createAppStore(
      fakeClient({
        households: {
          list: () =>
            new Promise<Household[]>((resolve) => {
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
    expect(store.getState().households).toEqual([]);
  });

  it('failed sign-out keeps the existing session available for a retry', async () => {
    const store = createAppStore(
      fakeClient({
        auth: {
          signOut: () => Promise.reject(new Error('Offline')),
        },
      }),
    );
    await store
      .getState()
      .signIn({ email: 'alex@example.com', password: 'password' });
    await expect(store.getState().signOut()).rejects.toThrow();
    expect(store.getState().session).toEqual(session);
    expect(store.getState().authPending).toBe(false);
  });

  it('registration waits for verification and never loads a household', async () => {
    let lists = 0;
    const store = createAppStore(
      fakeClient({
        households: {
          list: () => {
            lists++;
            return Promise.resolve([]);
          },
        },
      }),
    );
    const outcome = await store.getState().register({
      name: 'Alex',
      email: 'alex@example.com',
      password: 'password',
    });
    expect(outcome.status).toBe('verification-required');
    expect(store.getState().session).toBeNull();
    expect(store.getState().verificationEmail).toBe('alex@example.com');
    expect(lists).toBe(0);
  });

  it('restored unverified sessions cannot expose household data', async () => {
    const store = createAppStore(
      fakeClient({
        auth: {
          getSession: () =>
            Promise.resolve({
              ...session,
              user: { ...session.user, emailVerified: false },
            }),
        },
      }),
    );
    await store.getState().refreshSession();
    expect(store.getState().session).toBeNull();
    expect(store.getState().verificationEmail).toBe(session.user.email);
    expect(store.getState().households).toEqual([]);
  });

  it('resends share a cooldown and verification does not manufacture a session', async () => {
    let sends = 0;
    const store = createAppStore(
      fakeClient({
        auth: {
          resendVerification: () => {
            sends++;
            return Promise.resolve();
          },
        },
      }),
    );
    await store.getState().resendVerification('alex@example.com');
    await store.getState().resendVerification('alex@example.com');
    expect(sends).toBe(1);
    expect(store.getState().verificationStatus).toBe('sent');
    await store.getState().verifyEmail('test-token');
    expect(store.getState().verificationStatus).toBe('verified');
    expect(store.getState().session).toBeNull();
  });

  it('invalid verification links surface a recoverable error', async () => {
    const store = createAppStore(
      fakeClient({
        auth: {
          verifyEmail: () => Promise.reject(new Error('expired')),
        },
      }),
    );
    await store.getState().verifyEmail('expired-token');
    expect(store.getState().verificationStatus).toBe('error');
    expect(store.getState().verificationError).toMatch(/expired/);
    expect(store.getState().session).toBeNull();
  });
});
