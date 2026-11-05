import { View, styled } from '@tamagui/tailwind';
import type { ComponentProps } from 'react';

export const Card = styled(
  View,
  'rounded-lg border border-border bg-surface p-6 gap-4',
  {
    displayName: 'QuiltCard',
  },
);
export type CardProps = ComponentProps<typeof Card>;
