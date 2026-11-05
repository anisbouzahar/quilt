import { useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { CreateOrganizationSchema } from '@quilt/contracts';
import { Button, Card, Text, TextField, View, useQuiltTheme } from '@quilt/ui';
import { useAppStore } from '../../state/app-store';
import { EntryLayout } from '../auth/components/entry-layout';

export function HouseholdScreen() {
  const session = useAppStore((state) => state.session);
  const households = useAppStore((state) => state.households);
  const householdsStatus = useAppStore((state) => state.householdsStatus);
  const householdsError = useAppStore((state) => state.householdsError);
  const loadHouseholds = useAppStore((state) => state.loadHouseholds);
  const create = useAppStore((state) => state.createHousehold);
  const logout = useAppStore((state) => state.signOut);
  const authPending = useAppStore((state) => state.authPending);
  const householdPending = useAppStore((state) => state.householdPending);
  const pending = authPending || householdPending;
  const { colors } = useQuiltTheme();
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [error, setError] = useState<string>();
  const busy = useRef(false);
  const createHousehold = async () => {
    if (busy.current) return;
    const result = CreateOrganizationSchema.safeParse({ name });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message);
      return;
    }
    setFieldError(undefined);
    setError(undefined);
    busy.current = true;
    try {
      await create(result.data.name);
      setName('');
    } catch {
      setError('We couldn’t reach Quilt. Check your connection and try again.');
    } finally {
      busy.current = false;
    }
  };
  const signOut = async () => {
    if (busy.current) return;
    busy.current = true;
    setError(undefined);
    try {
      await logout();
    } catch {
      setError('We couldn’t reach Quilt. Please try again.');
    } finally {
      busy.current = false;
    }
  };
  return (
    <EntryLayout>
      <View className="w-full max-w-[560px] self-center px-6 py-10 gap-8">
        <View className="gap-3">
          <Text variant="display" style={{ fontSize: 36, lineHeight: '44px' }}>
            Good to see you
            {session?.user.name ? `, ${session.user.name.split(' ')[0]}` : ''}.
          </Text>
          <Text tone="textMuted">{session?.user.email}</Text>
        </View>
        {householdsStatus === 'loading' || householdsStatus === 'idle' ? (
          <ActivityIndicator
            color={colors.primary}
            accessibilityLabel="Loading households"
          />
        ) : householdsError ? (
          <Card>
            <Text tone="danger" role="alert">
              We couldn’t load your households.
            </Text>
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => {
                void loadHouseholds();
              }}
            />
          </Card>
        ) : households.length ? (
          <View className="gap-4">
            <Text variant="heading">Your households</Text>
            {households.map((organization) => (
              <Card
                key={organization.id}
                className="flex-row items-center gap-4"
              >
                <Feather
                  name="home"
                  size={24}
                  color={colors.primary}
                  accessible={false}
                />
                <View className="flex-1 gap-1">
                  <Text variant="title">{organization.name}</Text>
                  <Text variant="caption" tone="textMuted">
                    Household created. Your shared plans can begin here.
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card>
            <Feather
              name="home"
              size={28}
              color={colors.primary}
              accessible={false}
            />
            <Text variant="heading">Give your household a home.</Text>
            <Text tone="textMuted">
              Choose a name for the place where you’ll keep your shared spending
              and plans.
            </Text>
            <TextField
              label="Household name"
              placeholder="e.g. Our place"
              value={name}
              onChangeText={(value) => {
                setName(value);
                setFieldError(undefined);
                setError(undefined);
              }}
              error={fieldError}
              editable={!pending}
              maxLength={100}
              returnKeyType="go"
              onSubmitEditing={() => {
                void createHousehold();
              }}
            />
            <Button
              label="Create household"
              loading={pending}
              onPress={() => {
                void createHousehold();
              }}
            />
          </Card>
        )}
        {error && (
          <Text role="alert" tone="danger">
            {error}
          </Text>
        )}
        <Button
          label="Sign out"
          variant="secondary"
          disabled={pending}
          onPress={() => {
            void signOut();
          }}
        />
      </View>
    </EntryLayout>
  );
}
