import { createStore } from 'zustand/vanilla';
import type { ThemePreference } from '@quilt/ui/tokens';
import type { Household, QuiltClient, Session } from '../lib/client';

type Status = 'idle' | 'loading' | 'ready' | 'error';
export interface AppState {
  appearance: ThemePreference;
  session: Session | null;
  sessionStatus: Status;
  sessionError: string | null;
  authPending: boolean;
  households: Household[];
  householdsStatus: Status;
  householdsError: string | null;
  householdPending: boolean;
  setAppearance: (appearance: ThemePreference) => void;
  refreshSession: () => Promise<void>;
  signIn: QuiltClient['auth']['signIn'];
  register: QuiltClient['auth']['register'];
  signOut: () => Promise<void>;
  loadHouseholds: () => Promise<void>;
  createHousehold: (name: string) => Promise<void>;
}

export function createAppStore(client: QuiltClient) {
  let epoch = 0;
  let householdRevision = 0;
  let refresh: { epoch: number; promise: Promise<void> } | undefined;
  return createStore<AppState>()((set, get) => {
    const emptyHouseholds = {
      households: [],
      householdsStatus: 'idle' as const,
      householdsError: null,
      householdPending: false,
    };
    const authenticate = async (request: () => Promise<Session>) => {
      if (get().authPending)
        throw new Error('An account request is already in progress.');
      ++epoch;
      set({ authPending: true });
      try {
        const session = await request();
        set({
          session,
          sessionStatus: 'ready',
          sessionError: null,
          ...emptyHouseholds,
        });
        void get().loadHouseholds();
        return session;
      } finally {
        set({ authPending: false });
      }
    };
    return {
      appearance: 'system',
      session: null,
      sessionStatus: 'idle',
      sessionError: null,
      authPending: false,
      ...emptyHouseholds,
      setAppearance: (appearance) => set({ appearance }),
      refreshSession: () => {
        if (get().authPending) return Promise.resolve();
        if (refresh?.epoch === epoch) return refresh.promise;
        const started = epoch;
        const promise = (async () => {
          if (get().sessionStatus === 'idle') set({ sessionStatus: 'loading' });
          try {
            const session = await client.auth.getSession();
            if (started !== epoch) return;
            const changed = session?.user.id !== get().session?.user.id;
            set({
              session,
              sessionStatus: 'ready',
              sessionError: null,
              ...(changed || !session ? emptyHouseholds : {}),
            });
            if (session && (changed || get().householdsStatus === 'idle'))
              void get().loadHouseholds();
          } catch {
            if (started === epoch)
              set({
                session: null,
                sessionStatus: 'error',
                sessionError:
                  'We couldn’t reconnect to Quilt. Check your connection and try again.',
                ...emptyHouseholds,
              });
          }
        })();
        refresh = { epoch: started, promise };
        void promise.finally(() => {
          if (refresh?.promise === promise) refresh = undefined;
        });
        return promise;
      },
      signIn: (input) => authenticate(() => client.auth.signIn(input)),
      register: (input) => authenticate(() => client.auth.register(input)),
      signOut: async () => {
        if (get().authPending) return;
        ++epoch;
        set({ authPending: true });
        try {
          await client.auth.signOut();
          set({
            session: null,
            sessionStatus: 'ready',
            sessionError: null,
            ...emptyHouseholds,
          });
        } finally {
          set({ authPending: false });
        }
      },
      loadHouseholds: async () => {
        const userId = get().session?.user.id;
        if (!userId) return;
        const started = epoch;
        const revision = ++householdRevision;
        set({ householdsStatus: 'loading', householdsError: null });
        try {
          const households = await client.households.list();
          if (
            started === epoch &&
            revision === householdRevision &&
            userId === get().session?.user.id
          )
            set({ households, householdsStatus: 'ready' });
        } catch {
          if (started === epoch && revision === householdRevision)
            set({
              householdsStatus: 'error',
              householdsError:
                'We couldn’t load your households. Please try again.',
            });
        }
      },
      createHousehold: async (name) => {
        if (!get().session || get().householdPending) return;
        const started = epoch;
        set({ householdPending: true });
        try {
          const household = await client.households.create(name);
          if (started === epoch) {
            ++householdRevision;
            set({
              households: [
                ...get().households.filter((item) => item.id !== household.id),
                household,
              ],
              householdsStatus: 'ready',
              householdsError: null,
            });
          }
        } finally {
          if (started === epoch) set({ householdPending: false });
        }
      },
    };
  });
}
