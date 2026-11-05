import { useState } from 'react';
import { useAppearance } from '../state/appearance';
import { Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Button,
  Card,
  Text,
  TextField,
  layout,
  radii,
  spacing,
  useQuiltTheme,
  type ColorName,
} from '@quilt/ui';

const preferences = ['system', 'light', 'dark'] as const;
const swatches: { name: ColorName; label: string }[] = [
  { name: 'background', label: 'Canvas' },
  { name: 'surface', label: 'Surface' },
  { name: 'surfaceMuted', label: 'Subtle' },
  { name: 'primary', label: 'Sage' },
];

function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: string;
}) {
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}
    >
      <Text variant="caption" tone="textMuted" style={{ letterSpacing: 1 }}>
        {number}
      </Text>
      <Text variant="label">{children}</Text>
      <View className="flex-1 h-[1px] bg-border" />
    </View>
  );
}

export default function DesignSystemScreen() {
  const { preference, setPreference } = useAppearance();
  const { colors, mode } = useQuiltTheme();
  const { width } = useWindowDimensions();
  const wide = width >= layout.wideBreakpoint;
  const [category, setCategory] = useState('Everyday spending');
  const [requiredValue, setRequiredValue] = useState('');
  const [feedback, setFeedback] = useState(
    'Preview only. Your financial data stays unchanged.',
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 96 }}>
        <View className="w-full max-w-[1080px] self-center p-6 md:p-12 gap-12">
          <View
            style={{
              flexDirection: wide ? 'row' : 'column',
              alignItems: wide ? 'center' : 'flex-start',
              justifyContent: 'space-between',
              gap: spacing.xl,
              paddingBottom: spacing.xl,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
              }}
            >
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{
                  width: 22,
                  height: 22,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                {[0, 1, 2, 3].map((tile) => (
                  <View
                    key={tile}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      backgroundColor: colors.primary,
                      opacity: tile === 1 ? 0.45 : 1,
                    }}
                  />
                ))}
              </View>
              <Text
                variant="heading"
                role="none"
                style={{ letterSpacing: -0.9 }}
              >
                quilt
              </Text>
              <Text
                variant="caption"
                tone="textMuted"
                style={{ marginLeft: spacing.sm }}
              >
                Design foundations
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                padding: spacing.xs,
                gap: spacing.xs,
                borderRadius: radii.md,
                backgroundColor: colors.surfaceMuted,
              }}
            >
              {preferences.map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={`${value} theme${preference === value ? ', selected' : ''}`}
                  onPress={() => setPreference(value)}
                  style={({ pressed }) => ({
                    minHeight: 44,
                    justifyContent: 'center',
                    paddingHorizontal: spacing.lg,
                    borderRadius: radii.sm,
                    backgroundColor:
                      preference === value
                        ? colors.surface
                        : pressed
                          ? colors.border
                          : 'transparent',
                  })}
                >
                  <Text
                    variant="label"
                    tone={preference === value ? 'text' : 'textMuted'}
                  >
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View
            style={{
              gap: spacing.lg,
              paddingVertical: wide ? spacing.xl : spacing.sm,
            }}
          >
            <Text
              variant="caption"
              tone="textMuted"
              style={{ letterSpacing: 1.5 }}
            >
              CONSIDERED BY DESIGN
            </Text>
            <Text
              variant="display"
              className="md:text-[56px] md:leading-[64px] md:tracking-[-2px]"
            >
              Less noise.{wide ? ' ' : '\n'}More clarity.
            </Text>
            <Text tone="textMuted" style={{ maxWidth: 520 }}>
              A precise, quietly warm foundation for your money.
              {wide ? '\n' : ' '}Built to feel at home on every screen.
            </Text>
          </View>

          <View style={{ gap: spacing.xl }}>
            <SectionLabel number="01">Type & surface</SectionLabel>
            <View
              style={{
                flexDirection: wide ? 'row' : 'column',
                gap: spacing.xl,
              }}
            >
              <Card
                style={{
                  flex: wide ? 1 : undefined,
                  padding: spacing['2xl'],
                  gap: spacing.xl,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: spacing.md,
                  }}
                >
                  <Text variant="label" tone="textMuted">
                    Monthly overview
                  </Text>
                  <Text variant="caption" tone="textMuted">
                    SAMPLE DATA
                  </Text>
                </View>
                <View style={{ gap: spacing.xs }}>
                  <Text
                    variant="display"
                    role="none"
                    className="text-[36px] leading-[44px] md:text-[44px] md:leading-[52px] tracking-[-1.8px]"
                    style={{
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    €1,248.50
                  </Text>
                  <Text variant="caption" tone="textMuted">
                    A clear view of everyday spending
                  </Text>
                </View>
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingTop: spacing.lg,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    gap: spacing.md,
                  }}
                >
                  <Text variant="caption" tone="textMuted">
                    Shared household
                  </Text>
                  <Text variant="caption">November</Text>
                </View>
              </Card>
              <View
                style={{
                  flex: wide ? 1 : undefined,
                  justifyContent: 'center',
                  padding: spacing.lg,
                  gap: spacing.md,
                }}
              >
                <Text variant="heading">Everything in its place.</Text>
                <Text tone="textMuted">
                  A clean type hierarchy. Balanced spacing. Details that support
                  the numbers.
                </Text>
                <Text variant="label" style={{ marginTop: spacing.sm }}>
                  Tamagui · Quilt tokens
                </Text>
                <Text variant="caption" tone="textMuted">
                  Comfortable to read. Responsive to your text settings.
                </Text>
              </View>
            </View>
          </View>

          <View style={{ gap: spacing.xl }}>
            <SectionLabel number="02">Actions with depth</SectionLabel>
            <Card
              style={{
                padding: wide ? spacing['2xl'] : spacing.xl,
                gap: spacing.xl,
              }}
            >
              <View
                style={{
                  flexDirection: wide ? 'row' : 'column',
                  gap: spacing.lg,
                }}
              >
                <Button
                  label="Try primary action"
                  onPress={() =>
                    setFeedback(
                      'Primary action pressed. This is a design preview.',
                    )
                  }
                  style={wide ? { flex: 1 } : undefined}
                />
                <Button
                  label="Try secondary action"
                  variant="secondary"
                  onPress={() => setFeedback('Secondary action pressed.')}
                  style={wide ? { flex: 1 } : undefined}
                />
              </View>
              <View
                style={{
                  flexDirection: wide ? 'row' : 'column',
                  gap: spacing.lg,
                }}
              >
                <Button
                  label="Disabled action"
                  disabled
                  style={wide ? { flex: 1 } : undefined}
                />
                <Button
                  label="Working…"
                  loading
                  style={wide ? { flex: 1 } : undefined}
                />
              </View>
              <Text variant="caption" tone="textMuted" aria-live="polite">
                {feedback}
              </Text>
            </Card>
          </View>

          <View style={{ gap: spacing.xl }}>
            <SectionLabel number="03">A restrained palette</SectionLabel>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing.lg,
              }}
            >
              {swatches.map(({ name, label }) => (
                <View
                  key={name}
                  style={{ flex: 1, minWidth: 112, gap: spacing.md }}
                >
                  <View
                    style={{
                      height: wide ? 100 : 72,
                      borderRadius: radii.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors[name],
                    }}
                  />
                  <View style={{ gap: spacing.xs }}>
                    <Text variant="label">{label}</Text>
                    <Text variant="caption" tone="textMuted" selectable>
                      {colors[name]}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing.xl,
              }}
            >
              <Text variant="caption" tone="success">
                Saved successfully
              </Text>
              <Text variant="caption" tone="warning">
                Needs review
              </Text>
              <Text variant="caption" tone="danger">
                Unable to save
              </Text>
            </View>
          </View>

          <View style={{ gap: spacing.xl }}>
            <SectionLabel number="04">Simple, considered inputs</SectionLabel>
            <Card
              style={{
                flexDirection: wide ? 'row' : 'column',
                gap: spacing['2xl'],
              }}
            >
              <View style={{ flex: wide ? 1 : undefined, gap: spacing.xl }}>
                <TextField
                  label="Category name"
                  hint="A name that makes sense to your household."
                  value={category}
                  onChangeText={setCategory}
                />
                <TextField
                  label="Required field example"
                  placeholder="Enter a name"
                  value={requiredValue}
                  onChangeText={setRequiredValue}
                  error={
                    requiredValue.trim()
                      ? undefined
                      : 'Enter a name to continue.'
                  }
                />
              </View>
              <View style={{ flex: wide ? 1 : undefined, gap: spacing.xl }}>
                <TextField
                  label="Disabled field example"
                  value="Not available"
                  editable={false}
                />
                <Text variant="caption" tone="textMuted">
                  Visible focus. Clear feedback. Space to tap. The small things
                  are part of the system.
                </Text>
              </View>
            </Card>
          </View>
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingTop: spacing.xl,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: spacing.md,
            }}
          >
            <Text variant="caption" tone="textMuted">
              quilt · Less, but considered.
            </Text>
            <Text variant="caption" tone="textMuted">
              {mode === 'light' ? 'Light' : 'Dark'} palette · Web & mobile
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
