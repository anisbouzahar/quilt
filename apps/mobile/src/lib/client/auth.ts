import { AuthSessionSchema, type AuthSession } from '@quilt/contracts';
import type { RawAuthClient } from './auth-client';
import { ClientError, throwResponseError } from './errors';

export type Session = AuthSession;

export function createAuthApi(authClient: RawAuthClient) {
  async function getSession(): Promise<Session | null> {
    const result = await authClient.getSession({
      query: { disableCookieCache: true },
    });
    throwResponseError(result.error);
    return result.data === null ? null : AuthSessionSchema.parse(result.data);
  }

  async function requireSession(): Promise<Session> {
    const session = await getSession();
    if (!session) {
      throw new ClientError(
        'Your session could not be opened. Please sign in again.',
        401,
        'SESSION_UNAVAILABLE',
      );
    }
    return session;
  }

  return {
    getSession,
    requireSession,
    async signIn(input: { email: string; password: string }) {
      const result = await authClient.signIn.email(input);
      throwResponseError(result.error);
      return requireSession();
    },
    async register(input: { name: string; email: string; password: string }) {
      const result = await authClient.signUp.email(input);
      throwResponseError(result.error);
      return requireSession();
    },
    async signOut() {
      const result = await authClient.signOut();
      throwResponseError(result.error);
    },
    subscribe(listener: () => void) {
      return (
        authClient.$store.atoms.$sessionSignal?.listen(listener) ?? (() => {})
      );
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
