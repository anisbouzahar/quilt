import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';
import { QuiltProvider, type ThemePreference } from '@quilt/ui';

const AppearanceContext = createContext<{
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
} | null>(null);

export function AppearanceProvider({ children }: PropsWithChildren) {
  const [preference, setPreference] = useState<ThemePreference>('system');
  return (
    <AppearanceContext.Provider value={{ preference, setPreference }}>
      <QuiltProvider theme={preference}>{children}</QuiltProvider>
    </AppearanceContext.Provider>
  );
}
export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error('AppearanceProvider is required.');
  return context;
}
