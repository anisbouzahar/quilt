import { createAuthClient } from 'better-auth/client';
import { organizationClient } from 'better-auth/client/plugins';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
import { getBaseUrl } from './base-url';

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  fetchOptions: { timeout: 15000 },
  plugins: [
    organizationClient(),
    expoClient({
      scheme: 'quilt',
      storagePrefix: 'quilt',
      storage: SecureStore,
      disableCache: true,
    }),
  ],
});

export type RawAuthClient = typeof authClient;
