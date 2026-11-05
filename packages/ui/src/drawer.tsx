import { useEffect, useRef, type PropsWithChildren } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Dialog } from 'tamagui';
import { Button } from './button';
import { Text } from './text';
import { View } from '@tamagui/tailwind';

export interface DrawerProps extends PropsWithChildren {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  side?: 'left' | 'right';
  topInset?: number;
  bottomInset?: number;
}

/** Dialog supplies web focus management; native back closes the active drawer. */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  side = 'right',
  topInset = 0,
  bottomInset = 0,
  children,
}: DrawerProps) {
  const { width } = useWindowDimensions();
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open || Platform.OS === 'web') return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onOpenChange(false);
        return true;
      },
    );
    return () => subscription.remove();
  }, [open, onOpenChange]);
  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay backgroundColor="rgba(10,20,14,0.38)" />
        <Dialog.Content
          onOpenAutoFocus={() => {
            if (Platform.OS !== 'web') return;
            const element = globalThis.document.activeElement;
            returnFocus.current =
              element instanceof globalThis.HTMLElement ? element : null;
          }}
          onCloseAutoFocus={(event) => {
            if (Platform.OS !== 'web' || !returnFocus.current?.isConnected)
              return;
            event.cancel();
            returnFocus.current.focus();
          }}
          position="absolute"
          top={0}
          bottom={0}
          left={side === 'left' ? 0 : undefined}
          right={side === 'right' ? 0 : undefined}
          width={Math.min(width - 24, 440)}
          maxWidth="100%"
          padding={0}
          borderRadius={0}
          backgroundColor="surface"
          borderColor="border"
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                padding: 24,
                paddingTop: Math.max(topInset, 24),
                paddingBottom: Math.max(bottomInset, 24),
                gap: 24,
              }}
            >
              <View className="gap-2">
                <Dialog.Title fontSize={24} lineHeight="32px" color="text">
                  {title}
                </Dialog.Title>
                <Dialog.Description
                  color="textMuted"
                  fontSize={14}
                  lineHeight="22px"
                >
                  {description}
                </Dialog.Description>
              </View>
              {children}
              <Button
                variant="secondary"
                label="Close drawer"
                onPress={() => onOpenChange(false)}
              />
              <Text variant="caption" tone="textMuted">
                Quilt · A little more together.
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
