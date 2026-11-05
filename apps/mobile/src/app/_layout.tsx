import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useQuiltTheme } from '@quilt/ui';
import { AppearanceProvider } from '../state/appearance';

function RootNavigator() {
  const { colors, mode } = useQuiltTheme();
  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppearanceProvider>
        <RootNavigator />
      </AppearanceProvider>
    </SafeAreaProvider>
  );
}
