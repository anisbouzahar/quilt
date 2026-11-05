import type { PropsWithChildren } from 'react';
import { useWindowDimensions } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Text, View, useQuiltTheme } from '@quilt/ui';
import { EntryLayout } from './entry-layout';

function TogetherIllustration() {
  const { colors } = useQuiltTheme();
  return (
    <View
      aria-hidden
      style={{
        position: 'relative',
        width: 286,
        height: 236,
        alignSelf: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 20,
          left: 8,
          width: 176,
          height: 176,
          borderRadius: 36,
          borderWidth: 1,
          borderColor: colors.primary,
          opacity: 0.18,
          transform: [{ rotate: '-12deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 48,
          left: 60,
          width: 176,
          height: 176,
          borderRadius: 36,
          backgroundColor: colors.primary,
          transform: [{ rotate: '8deg' }],
          boxShadow: '0 16px 30px rgba(12,24,16,0.12)',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 36,
            top: 36,
            width: 104,
            height: 104,
            borderWidth: 1,
            borderColor: colors.onPrimary,
            opacity: 0.35,
            borderRadius: 24,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 84,
            top: 36,
            width: 1,
            height: 104,
            backgroundColor: colors.onPrimary,
            opacity: 0.35,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 36,
            top: 84,
            width: 104,
            height: 1,
            backgroundColor: colors.onPrimary,
            opacity: 0.35,
          }}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          right: 4,
          top: 12,
          width: 58,
          height: 58,
          borderRadius: 20,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: '8deg' }],
          boxShadow: '0 6px 18px rgba(12,24,16,0.06)',
        }}
      >
        <Feather name="check" size={25} color={colors.primary} />
      </View>
    </View>
  );
}

export function AuthLayout({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions();
  const { colors } = useQuiltTheme();
  const wide = width >= 960;
  return (
    <EntryLayout>
      <View
        style={{
          flex: 1,
          flexDirection: wide ? 'row' : 'column',
          width: '100%',
          maxWidth: 1200,
          alignSelf: 'center',
          paddingHorizontal: wide ? 40 : 24,
          paddingTop: wide ? 24 : 32,
          paddingBottom: 48,
          gap: 64,
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: wide ? 40 : 0,
          }}
        >
          <View style={{ width: '100%', maxWidth: 400 }}>{children}</View>
        </View>
        {wide && (
          <View
            style={{
              flex: 1,
              borderRadius: 28,
              padding: 48,
              backgroundColor: colors.surfaceMuted,
              justifyContent: 'center',
              minHeight: 560,
              gap: 36,
            }}
          >
            <TogetherIllustration />
            <View className="gap-4">
              <Text
                variant="display"
                style={{
                  fontSize: 42,
                  lineHeight: '48px',
                  letterSpacing: -1.5,
                }}
              >
                Split the bills.{`\n`}Share the plan.
              </Text>
              <Text tone="textMuted" style={{ maxWidth: 310 }}>
                From the weekly shop to a place of your own. Keep track of what
                you spend together and what you’re saving for.
              </Text>
            </View>
          </View>
        )}
      </View>
    </EntryLayout>
  );
}
