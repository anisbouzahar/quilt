import type { PropsWithChildren } from 'react';
import { QuiltProvider } from '@quilt/ui';
import { useAppStore } from './app-store';

export function AppearanceProvider({ children }: PropsWithChildren) {
  const preference = useAppStore((state) => state.appearance);
  return <QuiltProvider theme={preference}>{children}</QuiltProvider>;
}
export function useAppearance() {
  const preference = useAppStore((state) => state.appearance);
  const setPreference = useAppStore((state) => state.setAppearance);
  return { preference, setPreference };
}
