import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { tokens } from '../../theme/tokens';

type ButtonProps = Omit<PressableProps, 'children'> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? tokens.color.text : tokens.color.paper}
        />
      ) : typeof children === 'string' ? (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  primary: { backgroundColor: tokens.color.accent },
  secondary: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.border,
  },
  danger: { backgroundColor: tokens.color.danger },
  label: {
    fontSize: tokens.typography.size.body,
    fontWeight: tokens.typography.weight.semibold,
  },
  primaryLabel: { color: tokens.color.text },
  secondaryLabel: { color: tokens.color.paper },
  dangerLabel: { color: tokens.color.paper },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.56 },
});
