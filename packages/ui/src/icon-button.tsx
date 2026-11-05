import { html } from '@tamagui/tailwind';
import type { ComponentProps } from 'react';

export function IconButton({
  className = '',
  ...props
}: ComponentProps<typeof html.button>) {
  return (
    <html.button
      type="button"
      {...props}
      className={`border-0 flex flex-col items-center justify-center min-h-[48px] min-w-[48px] rounded-lg bg-surface hover:bg-surfaceMuted press:bg-surfaceMuted focus-visible:outline-2 focus-visible:outline-primary ${className}`}
    />
  );
}
