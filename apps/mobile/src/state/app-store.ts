import { useStore } from 'zustand';
import { client } from '../lib/client';
import { createAppStore, type AppState } from './create-app-store';

export const appStore = createAppStore(client);
export function useAppStore<T>(selector: (state: AppState) => T): T {
  return useStore(appStore, selector);
}

export function subscribeToSessionChanges() {
  return client.auth.subscribe(() => {
    void appStore.getState().refreshSession();
  });
}
