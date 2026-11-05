import { authClient } from './auth-client';
import { createAuthApi } from './auth';
import { createHouseholdsApi } from './households';

export { ClientError } from './errors';
export { getBaseUrl } from './base-url';
export type { Session } from './auth';
export type { Household } from './households';

export const client = {
  auth: createAuthApi(authClient),
  households: createHouseholdsApi(authClient),
};

export type QuiltClient = typeof client;
