import type { PropsWithChildren } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton, Text, View, useQuiltTheme } from '@quilt/ui';
import { useAppearance } from '../../../state/appearance';
import appIcon from '../../../../assets/favicon.png';

export function EntryLayout({ children }: PropsWithChildren) {
  const { colors, mode } = useQuiltTheme();
  const { setPreference } = useAppearance();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <View className="flex-row items-center justify-between px-6 md:px-10 py-4">
          <Link href="/" aria-label="Quilt home">
            <View className="flex-row items-center gap-2">
              <Image
                source={appIcon}
                style={{ width: 32, height: 32, borderRadius: 9 }}
                accessible={false}
                accessibilityIgnoresInvertColors
              />
              <Text
                variant="title"
                style={{ fontSize: 23, letterSpacing: -0.8 }}
              >
                Quilt
              </Text>
            </View>
          </Link>
          <IconButton
            aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} theme`}
            onPress={() => setPreference(mode === 'light' ? 'dark' : 'light')}
            style={{ backgroundColor: 'transparent' }}
          >
            <Feather
              name={mode === 'light' ? 'moon' : 'sun'}
              size={18}
              color={colors.textMuted}
              accessible={false}
            />
          </IconButton>
        </View>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
