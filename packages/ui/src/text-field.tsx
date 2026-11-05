import {
  useId,
  type ComponentProps,
  type ComponentRef,
  type ReactNode,
  type Ref,
} from 'react';
import { View } from '@tamagui/tailwind';
import { Input } from 'tamagui';
import { Text } from './text';

export interface TextFieldProps extends Omit<
  ComponentProps<typeof Input>,
  'size' | 'className'
> {
  label: string;
  className?: string;
  editable?: boolean;
  hint?: string;
  error?: string;
  endAdornment?: ReactNode;
  ref?: Ref<ComponentRef<typeof Input>>;
}

export function TextField({
  label,
  className = '',
  hint,
  error,
  endAdornment,
  id,
  ref,
  editable = true,
  disabled = false,
  'aria-label': ariaLabel,
  'aria-describedby': describedBy,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const description = error ?? hint;
  return (
    <View className={`gap-2 ${className}`}>
      <Text variant="label">{label}</Text>
      <View className="relative">
        <Input
          {...props}
          ref={ref}
          id={inputId}
          size={false}
          disabled={disabled || !editable}
          aria-label={ariaLabel ?? label}
          aria-describedby={
            [describedBy, description ? descriptionId : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
          aria-invalid={Boolean(error)}
          fontFamily="body"
          fontSize={16}
          lineHeight="24px"
          minBlockSize={48}
          paddingInline={16}
          paddingInlineEnd={endAdornment ? 60 : 16}
          paddingBlock={12}
          borderRadius="md"
          borderWidth={1}
          borderColor={error ? 'danger' : 'controlBorder focus:primary'}
          color="text"
          backgroundColor="surface"
          placeholderTextColor="textMuted"
          opacity={disabled || !editable ? 0.5 : 1}
          outlineColor={
            error ? 'focus-visible:danger' : 'focus-visible:primary'
          }
          outlineWidth="focus-visible:2px"
          outlineStyle="focus-visible:solid"
          outlineOffset="focus-visible:2px"
        />
        {endAdornment && (
          <View className="absolute right-0 top-0 bottom-0 justify-center pr-1">
            {endAdornment}
          </View>
        )}
      </View>
      {description && (
        <Text
          id={descriptionId}
          variant="caption"
          tone={error ? 'danger' : 'textMuted'}
          aria-live="polite"
        >
          {description}
        </Text>
      )}
    </View>
  );
}
