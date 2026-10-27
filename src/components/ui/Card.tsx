import type { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { tokens } from '../../theme/tokens';

type CardProps = {
  children: ReactNode;
  variant?: 'paper' | 'dark';
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, variant = 'paper', style }: CardProps) {
  return (
    <View style={[styles.card, styles[variant], style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: tokens.spacing.xl,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.border,
    gap: tokens.spacing.md,
  },
  paper: { backgroundColor: tokens.color.paper },
  dark: { backgroundColor: tokens.color.surface },
});
