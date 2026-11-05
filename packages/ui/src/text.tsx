import { Text as BaseText, type TailwindTextProps } from '@tamagui/tailwind';

const variants = {
  display: 'text-5xl leading-[52px] font-medium tracking-[-1.5px]',
  heading: 'text-2xl leading-[32px] font-medium tracking-[-0.6px]',
  title: 'text-lg leading-[26px] font-medium tracking-[-0.3px]',
  body: 'text-base leading-[24px] font-normal',
  label: 'text-sm leading-[20px] font-semibold',
  caption: 'text-xs leading-[20px] font-normal',
} as const;
const tones = {
  text: 'text-text',
  textMuted: 'text-textMuted',
  danger: 'text-danger',
  success: 'text-success',
  warning: 'text-warning',
} as const;

export interface TextProps extends TailwindTextProps {
  variant?: keyof typeof variants;
  tone?: keyof typeof tones;
}

export function Text({
  variant = 'body',
  tone = 'text',
  className = '',
  selectable,
  role,
  style,
  ...props
}: TextProps) {
  const resolvedRole =
    role ??
    (variant === 'display' || variant === 'heading' ? 'heading' : undefined);
  return (
    <BaseText
      role={resolvedRole}
      aria-level={
        resolvedRole === 'heading' ? (variant === 'display' ? 1 : 2) : undefined
      }
      {...props}
      style={[selectable ? { userSelect: 'text' } : undefined, style]}
      className={`font-body ${variants[variant]} ${tones[tone]} ${className}`}
    />
  );
}
