import { useWindowDimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Button, Text, View, useQuiltTheme } from '@quilt/ui';
import { EntryLayout } from '../auth/components/entry-layout';

function SharedPlan() {
  const { colors } = useQuiltTheme();
  return (
    <View
      aria-hidden
      style={{
        position: 'relative',
        width: 310,
        height: 280,
        alignSelf: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: 226,
          height: 226,
          top: 26,
          left: 44,
          backgroundColor: colors.surfaceMuted,
          borderRadius: 60,
          transform: [{ rotate: '-12deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 12,
          top: 30,
          width: 224,
          padding: 22,
          gap: 14,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 20,
          transform: [{ rotate: '-6deg' }],
          boxShadow: '0 12px 32px rgba(12,24,16,0.07)',
        }}
      >
        <View className="flex-row items-center gap-3">
          <Feather name="home" size={18} color={colors.primary} />
          <Text variant="label">The everyday, covered.</Text>
        </View>
        <View className="gap-3 border-t border-border pt-3">
          <Text variant="caption" tone="textMuted">
            Rent & bills
          </Text>
          <Text variant="caption" tone="textMuted">
            The weekly shop
          </Text>
        </View>
      </View>
      <View
        style={{
          position: 'absolute',
          right: 0,
          bottom: 18,
          width: 210,
          padding: 22,
          gap: 16,
          backgroundColor: colors.primary,
          borderRadius: 20,
          transform: [{ rotate: '7deg' }],
          boxShadow: '0 12px 28px rgba(12,24,16,0.12)',
        }}
      >
        <Feather name="sunrise" size={26} color={colors.onPrimary} />
        <Text variant="title" style={{ color: colors.onPrimary }}>
          Room for{`\n`}the next chapter.
        </Text>
        <View
          style={{
            height: 3,
            width: 56,
            borderRadius: 2,
            backgroundColor: colors.onPrimary,
            opacity: 0.5,
          }}
        />
      </View>
    </View>
  );
}

export function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const { colors } = useQuiltTheme();
  const router = useRouter();
  const wide = width >= 960;
  return (
    <EntryLayout>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 1120,
          alignSelf: 'center',
          justifyContent: 'center',
          paddingHorizontal: wide ? 48 : 24,
          paddingTop: wide ? 48 : 16,
          paddingBottom: 36,
          gap: wide ? 64 : 32,
        }}
      >
        <View
          style={{
            flexDirection: wide ? 'row' : 'column',
            alignItems: wide ? 'center' : 'stretch',
            gap: wide ? 48 : 28,
          }}
        >
          {!wide && <SharedPlan />}
          <View style={{ flex: wide ? 1.25 : undefined, gap: 24 }}>
            <View className="gap-4">
              <Text
                variant="display"
                style={{
                  fontSize: wide ? 56 : 38,
                  lineHeight: wide ? '62px' : '44px',
                  letterSpacing: wide ? -2.2 : -1.4,
                }}
              >
                Less “who paid?”{`\n`}More “what’s next?”
              </Text>
              <Text
                tone="textMuted"
                style={{ maxWidth: 440, fontSize: 17, lineHeight: '27px' }}
              >
                A home for the money you share. Keep household spending,
                budgets, and savings goals in one clear picture.
              </Text>
            </View>
            <View
              style={{
                width: '100%',
                maxWidth: wide ? 300 : undefined,
                gap: 12,
              }}
            >
              <Button
                label="Create an account"
                onPress={() => router.push('/sign-up')}
              />
              <Link
                href="/sign-in"
                style={{ alignSelf: 'center', paddingVertical: 14 }}
              >
                <Text variant="label" tone="textMuted">
                  Already a member?{' '}
                  <Text variant="label" style={{ color: colors.primary }}>
                    Sign in →
                  </Text>
                </Text>
              </Link>
            </View>
          </View>
          {wide && (
            <View style={{ flex: 1 }}>
              <SharedPlan />
            </View>
          )}
        </View>
        <View className="flex-row flex-wrap justify-between gap-5 border-t border-border pt-6">
          {(
            [
              ['credit-card', 'Track shared spending'],
              ['pie-chart', 'Plan the month'],
              ['flag', 'Save for what’s next'],
            ] as const
          ).map(([icon, label]) => (
            <View key={icon} className="flex-row items-center gap-2">
              <Feather
                name={icon}
                size={16}
                color={colors.primary}
                accessible={false}
              />
              <Text variant="caption" tone="textMuted">
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </EntryLayout>
  );
}
