import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { tokens } from '../../theme/tokens';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function TextField({
  label,
  error,
  style,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        accessibilityLabel={props.accessibilityLabel ?? label}
        placeholderTextColor={tokens.color.textMuted}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          focused && styles.focused,
          error && styles.invalid,
          style,
        ]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.xs },
  label: {
    color: tokens.color.text,
    fontSize: tokens.typography.size.caption,
    fontWeight: tokens.typography.weight.semibold,
  },
  input: {
    minHeight: 48,
    backgroundColor: tokens.color.paperMuted,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    color: tokens.color.text,
    fontFamily: tokens.typography.family.body,
    fontSize: tokens.typography.size.body,
  },
  focused: { borderColor: tokens.color.info },
  invalid: { borderColor: tokens.color.danger },
  error: {
    color: tokens.color.danger,
    fontSize: tokens.typography.size.caption,
  },
});
