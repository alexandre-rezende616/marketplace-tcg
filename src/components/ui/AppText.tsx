import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { tokens } from '../../theme/tokens';

type AppTextProps = TextProps & {
  children: ReactNode;
  variant?: 'body' | 'caption' | 'title' | 'display';
  tone?: 'primary' | 'muted' | 'inverse' | 'accent';
  style?: StyleProp<TextStyle>;
};

export function AppText({
  children,
  variant = 'body',
  tone = 'primary',
  style,
  ...props
}: AppTextProps) {
  return (
    <Text style={[styles[variant], styles[tone], style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: tokens.typography.family.body,
    fontSize: tokens.typography.size.body,
    lineHeight: tokens.typography.lineHeight.body,
    fontWeight: tokens.typography.weight.regular,
  },
  caption: {
    fontFamily: tokens.typography.family.body,
    fontSize: tokens.typography.size.caption,
    fontWeight: tokens.typography.weight.medium,
  },
  title: {
    fontFamily: tokens.typography.family.heading,
    fontSize: tokens.typography.size.title,
    lineHeight: tokens.typography.lineHeight.title,
    fontWeight: tokens.typography.weight.semibold,
  },
  display: {
    fontFamily: tokens.typography.family.heading,
    fontSize: tokens.typography.size.display,
    lineHeight: tokens.typography.lineHeight.display,
    fontWeight: tokens.typography.weight.semibold,
  },
  primary: { color: tokens.color.text },
  muted: { color: tokens.color.textMuted },
  inverse: { color: tokens.color.textOnDark },
  accent: { color: tokens.color.accent },
});
