import type { PropsWithChildren } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View } from '@quilt/ui';

export function Page({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle: string }>) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 96 + insets.bottom,
      }}
    >
      <View className="w-full max-w-[1120px] self-center p-6 md:p-10 gap-8">
        <View className="gap-2">
          <Text variant="caption" tone="textMuted" className="tracking-[2px]">
            OUR HOUSEHOLD · DEMO
          </Text>
          <Text variant="display" className="text-4xl leading-[44px]">
            {title}
          </Text>
          <Text tone="textMuted">{subtitle}</Text>
        </View>
        {children}
      </View>
    </ScrollView>
  );
}
