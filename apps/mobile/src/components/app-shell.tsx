import {
  createContext,
  useContext,
  useState,
  type ComponentProps,
} from 'react';
import { Image, useWindowDimensions } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Tabs, useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActionMenu,
  Button,
  Drawer,
  IconButton,
  Text,
  TextField,
  View,
  useQuiltTheme,
} from '@quilt/ui';
import { useAppearance } from '../state/appearance';
import appIcon from '../../assets/favicon.png';

type IconName = ComponentProps<typeof Feather>['name'];
const destinations: {
  name: string;
  label: string;
  icon: IconName;
  href: Href;
}[] = [
  { name: 'index', label: 'Overview', icon: 'grid', href: '/' },
  {
    name: 'spending',
    label: 'Spending',
    icon: 'credit-card',
    href: '/spending',
  },
  { name: 'budgets', label: 'Budgets', icon: 'pie-chart', href: '/budgets' },
  { name: 'goals', label: 'Goals', icon: 'target', href: '/goals' },
];
const ShellContext = createContext<(() => void) | null>(null);
export function useAddExpense() {
  const open = useContext(ShellContext);
  if (!open) throw new Error('App shell is required.');
  return open;
}
export function Icon({
  name,
  size = 20,
  color,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const { colors } = useQuiltTheme();
  return (
    <Feather
      name={name}
      size={size}
      color={color ?? colors.text}
      accessible={false}
    />
  );
}

type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];
function FloatingNavigation({ state, emitter, navigateToTab }: TabBarProps) {
  const { colors } = useQuiltTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const rail = width >= 1024;
  const dockWidth = Math.min(width - 32, 344);
  return (
    <View
      role="tablist"
      aria-label="Main navigation"
      style={{
        position: 'absolute',
        ...(rail
          ? { left: 20, top: 24, width: 72 }
          : {
              bottom: Math.max(insets.bottom, 16),
              left: (width - dockWidth) / 2,
              width: dockWidth,
            }),
        flexDirection: rail ? 'column' : 'row',
        padding: 6,
        gap: 4,
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 18,
        boxShadow: '0px 4px 18px rgba(12,24,16,0.08)',
      }}
    >
      {destinations.map((item) => {
        const route = state.routes.find((route) => route.name === item.name);
        const active = state.routes[state.index]?.name === item.name;
        return (
          <IconButton
            key={item.name}
            role="tab"
            aria-label={item.label}
            aria-selected={active}
            onPress={() => {
              if (!route) return;
              const event = emitter.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!active && !event.defaultPrevented) navigateToTab(route.key);
            }}
            style={{
              flex: rail ? undefined : 1,
              gap: 2,
              paddingVertical: 6,
              borderRadius: 12,
              backgroundColor: active ? colors.primary : colors.surface,
            }}
          >
            <Icon
              name={item.icon}
              size={18}
              color={active ? colors.onPrimary : colors.textMuted}
            />
            <Text
              variant="caption"
              style={{
                color: active ? colors.onPrimary : colors.textMuted,
                fontSize: 11,
                lineHeight: '14px',
              }}
            >
              {item.label}
            </Text>
          </IconButton>
        );
      })}
    </View>
  );
}

export default function AppShell() {
  const { colors } = useQuiltTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { preference, setPreference } = useAppearance();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState('');
  const rail = width >= 1024;
  const openExpense = () => {
    setFeedback('');
    setExpenseOpen(true);
  };
  const go = (href: Href) => {
    setNavigationOpen(false);
    router.push(href);
  };
  return (
    <ShellContext.Provider value={openExpense}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top,
        }}
      >
        <View
          className="flex-row items-center justify-between px-4 md:px-8 py-3 border-b border-border bg-background"
          style={{ gap: 12 }}
        >
          <View className="flex-row items-center gap-3">
            <Image
              source={appIcon}
              style={{ width: 36, height: 36, borderRadius: 10 }}
              accessibilityIgnoresInvertColors
              accessible={false}
            />
            <Text variant="title" style={{ letterSpacing: -0.7 }}>
              Quilt
            </Text>
            {width >= 640 && (
              <Text
                variant="caption"
                tone="textMuted"
                style={{ marginLeft: 12 }}
              >
                Our household / Demo
              </Text>
            )}
          </View>
          <View className="flex-row items-center gap-2">
            {width >= 640 && (
              <Button label="Add expense" onPress={openExpense} />
            )}
            {width < 640 && (
              <IconButton aria-label="Add expense" onPress={openExpense}>
                <Icon name="plus" />
              </IconButton>
            )}
            <ActionMenu
              label="Appearance"
              topInset={insets.top}
              bottomInset={insets.bottom}
              trigger={(onPress) => (
                <IconButton aria-label="Appearance menu" onPress={onPress}>
                  <Icon name="sun" />
                </IconButton>
              )}
              actions={(['system', 'light', 'dark'] as const).map((value) => ({
                label: `${value.charAt(0).toUpperCase()}${value.slice(1)}${preference === value ? ' · selected' : ''}`,
                onSelect: () => setPreference(value),
              }))}
            />
            <IconButton
              aria-label="Open navigation menu"
              onPress={() => setNavigationOpen(true)}
            >
              <Icon name="menu" />
            </IconButton>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Tabs
            tabBar={(props) => <FloatingNavigation {...props} />}
            backBehavior="history"
            screenOptions={{
              headerShown: false,
              sceneStyle: {
                backgroundColor: colors.background,
                marginLeft: rail ? 104 : 0,
              },
            }}
          >
            <Tabs.Screen name="index" options={{ title: 'Overview' }} />
            <Tabs.Screen name="spending" options={{ title: 'Spending' }} />
            <Tabs.Screen name="budgets" options={{ title: 'Budgets' }} />
            <Tabs.Screen name="goals" options={{ title: 'Goals' }} />
            <Tabs.Screen
              name="design-system"
              options={{ title: 'Design system' }}
            />
            <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
          </Tabs>
        </View>
        <Drawer
          open={navigationOpen}
          onOpenChange={setNavigationOpen}
          side="left"
          title="Your Quilt"
          description="One place for your household’s money. You’re exploring the demo workspace."
          topInset={insets.top}
          bottomInset={insets.bottom}
        >
          <View className="gap-2">
            {destinations.map((item) => (
              <Button
                key={item.name}
                variant="secondary"
                label={item.label}
                onPress={() => go(item.href)}
              />
            ))}
          </View>
          <View className="gap-2 border-t border-border pt-6">
            <Button
              variant="secondary"
              label="Design system"
              onPress={() => go('/design-system')}
            />
            <Button
              variant="secondary"
              label="Settings"
              onPress={() => go('/settings')}
            />
          </View>
        </Drawer>
        <Drawer
          open={expenseOpen}
          onOpenChange={setExpenseOpen}
          title="Add an expense"
          description="Try the entry flow. This is a local preview; nothing is saved or sent to the API."
          topInset={insets.top}
          bottomInset={insets.bottom}
        >
          <TextField
            label="What was it for?"
            placeholder="e.g. Weekly groceries"
            value={description}
            onChangeText={setDescription}
          />
          <TextField
            label="Amount (€)"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          <Button
            label="Preview expense"
            onPress={() => {
              const parsed = Number(amount.trim().replace(',', '.'));
              setFeedback(
                !description.trim() || !Number.isFinite(parsed) || parsed <= 0
                  ? 'Enter a description and an amount greater than zero.'
                  : `${description.trim()} · €${parsed.toFixed(2)}. Preview only — not saved.`,
              );
            }}
          />
          {!!feedback && (
            <Text role="status" aria-live="polite">
              {feedback}
            </Text>
          )}
        </Drawer>
      </View>
    </ShellContext.Provider>
  );
}
