import { useState } from 'react';
import { Link } from 'expo-router';
import {
  ActionMenu,
  Button,
  Card,
  IconButton,
  Text,
  View,
  useQuiltTheme,
} from '@quilt/ui';
import { Icon, useAddExpense } from '../components/app-shell';
import { Page } from '../components/page';
import { useAppearance } from '../state/appearance';

const expenses = [
  {
    title: 'Weekly groceries',
    category: 'Groceries',
    detail: 'Today · Paid by Alex',
    amount: '€86.40',
    icon: 'shopping-bag' as const,
  },
  {
    title: 'Sunday coffee',
    category: 'Dining',
    detail: 'Yesterday · Paid by Sam',
    amount: '€12.00',
    icon: 'coffee' as const,
  },
  {
    title: 'Electricity',
    category: 'Home',
    detail: 'Nov 2 · Paid by Alex',
    amount: '€74.20',
    icon: 'zap' as const,
  },
];
function ExpenseList({ category = 'All' }: { category?: string }) {
  const filtered = expenses.filter(
    (item) => category === 'All' || item.category === category,
  );
  return (
    <View className="gap-2">
      {filtered.map((item) => (
        <View key={item.title} className="flex-row items-center gap-3 py-3">
          <View className="w-12 h-12 items-center justify-center rounded-lg bg-surfaceMuted">
            <Icon name={item.icon} />
          </View>
          <View className="flex-1 gap-1">
            <Text variant="label">{item.title}</Text>
            <Text variant="caption" tone="textMuted">
              {item.detail}
            </Text>
          </View>
          <Text variant="label">{item.amount}</Text>
        </View>
      ))}
    </View>
  );
}
function Progress({ value, label }: { value: number; label: string }) {
  const { colors } = useQuiltTheme();
  return (
    <View
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className="h-2 rounded-full bg-surfaceMuted overflow-hidden"
    >
      <View
        style={{
          height: 8,
          width: `${value}%`,
          backgroundColor: colors.primary,
          borderRadius: 8,
        }}
      />
    </View>
  );
}
export function OverviewScreen() {
  const addExpense = useAddExpense();
  const { colors } = useQuiltTheme();
  return (
    <Page
      title="Room for what matters."
      subtitle="A calmer view of the money you share."
    >
      <View className="flex-col md:flex-row gap-4">
        <Card className="md:flex-1 bg-primary border-primary p-6 md:p-8 gap-6">
          <View className="flex-row justify-between items-center">
            <Text className="text-onPrimary" variant="label">
              Left in your monthly plan
            </Text>
            <Icon name="arrow-up-right" color={colors.onPrimary} />
          </View>
          <View className="gap-2">
            <Text variant="display" role="none" className="text-onPrimary">
              €1,284.60
            </Text>
            <Text className="text-onPrimary">
              of €2,400 planned for November
            </Text>
          </View>
          <Text variant="caption" className="text-onPrimary">
            Illustrative balance · No bank account connected
          </Text>
        </Card>
        <Card className="md:flex-1 p-6 md:p-8 justify-between gap-6">
          <View className="gap-2">
            <Text variant="caption" tone="textMuted">
              A SHARED PICTURE
            </Text>
            <Text variant="heading">Little things, together.</Text>
            <Text tone="textMuted">
              Keep everyday spending in view and make space for your next
              chapter.
            </Text>
          </View>
          <Button label="Add an expense" onPress={addExpense} />
        </Card>
      </View>
      <View className="flex-col md:flex-row gap-6">
        <Card className="md:flex-[2] gap-4">
          <View className="flex-row items-center justify-between">
            <Text variant="heading">Recent activity</Text>
            <Link href="/spending" accessibilityLabel="View all spending">
              <Text variant="label" className="text-primary">
                View all →
              </Text>
            </Link>
          </View>
          <ExpenseList />
        </Card>
        <Card className="md:flex-1 gap-6">
          <View className="flex-row justify-between items-center">
            <Icon name="sunrise" />
            <Text variant="caption" tone="textMuted">
              SHARED GOAL
            </Text>
          </View>
          <View className="gap-2">
            <Text variant="heading">A little getaway</Text>
            <Text tone="textMuted">€650 of €1,000</Text>
          </View>
          <Progress value={65} label="Getaway savings" />
          <Link href="/goals">
            <Text variant="label" className="text-primary">
              See your goals →
            </Text>
          </Link>
        </Card>
      </View>
      <Text variant="caption" tone="textMuted">
        Made for two. Built around your household. All figures here are sample
        data.
      </Text>
    </Page>
  );
}
export function SpendingScreen() {
  const [category, setCategory] = useState('All');
  const addExpense = useAddExpense();
  return (
    <Page
      title="Everyday, in view."
      subtitle="The small moments that make up your month."
    >
      <View className="flex-row justify-between items-center gap-3">
        <ActionMenu
          label="Filter spending"
          trigger={(onPress) => (
            <Button
              variant="secondary"
              onPress={onPress}
              label={`Category: ${category}`}
            />
          )}
          actions={['All', 'Groceries', 'Dining', 'Home'].map((label) => ({
            label,
            onSelect: () => setCategory(label),
          }))}
        />
        <IconButton aria-label="Add expense" onPress={addExpense}>
          <Icon name="plus" />
        </IconButton>
      </View>
      <Card>
        <Text variant="heading">November activity</Text>
        <ExpenseList category={category} />
        <Text variant="caption" tone="textMuted">
          Showing sample expenses. Filters apply to this demo list.
        </Text>
      </Card>
    </Page>
  );
}
export function BudgetsScreen() {
  return (
    <Page
      title="A plan with breathing room."
      subtitle="Simple limits for the life you’re building together."
    >
      <View className="gap-4">
        {[
          { name: 'Groceries', spent: '€284', total: '€500', progress: 57 },
          {
            name: 'Dining & coffee',
            spent: '€92',
            total: '€250',
            progress: 37,
          },
          {
            name: 'Home & bills',
            spent: '€739',
            total: '€1,200',
            progress: 62,
          },
        ].map((item) => (
          <Card key={item.name}>
            <View className="flex-row justify-between items-center">
              <Text variant="title">{item.name}</Text>
              <Text variant="label">
                {item.spent} / {item.total}
              </Text>
            </View>
            <Progress
              value={item.progress}
              label={`${item.name} budget used`}
            />
          </Card>
        ))}
      </View>
      <Text variant="caption" tone="textMuted">
        Sample monthly plans. Budget editing will connect to the household API.
      </Text>
    </Page>
  );
}
export function GoalsScreen() {
  return (
    <Page
      title="Something to look forward to."
      subtitle="Shared goals, one small step at a time."
    >
      <Card className="gap-6">
        <Icon name="sunrise" size={32} />
        <Text variant="heading">A little getaway</Text>
        <Text variant="display" role="none">
          €650 <Text tone="textMuted">/ €1,000</Text>
        </Text>
        <Progress value={65} label="Getaway savings" />
        <Text tone="textMuted">
          65% of the way to a few days away together.
        </Text>
        <Text variant="caption" tone="textMuted">
          Sample goal · Contributions are not connected yet.
        </Text>
      </Card>
    </Page>
  );
}
export function SettingsScreen() {
  const { preference, setPreference } = useAppearance();
  return (
    <Page
      title="Make yourself at home."
      subtitle="A few thoughtful preferences for your Quilt."
    >
      <Card>
        <Text variant="heading">Appearance</Text>
        <Text tone="textMuted">
          Choose a theme, or follow your device. This preference applies to your
          current app session.
        </Text>
        <View className="gap-3">
          {(['system', 'light', 'dark'] as const).map((value) => (
            <Button
              key={value}
              label={`${value.charAt(0).toUpperCase()}${value.slice(1)}${preference === value ? ' · selected' : ''}`}
              variant={preference === value ? 'primary' : 'secondary'}
              onPress={() => setPreference(value)}
            />
          ))}
        </View>
      </Card>
      <Card>
        <Text variant="heading">Demo workspace</Text>
        <Text tone="textMuted">
          Authentication, household membership, and stored financial records
          will be connected to the NestJS API.
        </Text>
        <Link href="/design-system">
          <Text variant="label" className="text-primary">
            Explore the design system →
          </Text>
        </Link>
      </Card>
    </Page>
  );
}
