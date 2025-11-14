// components/ui/Typography.tsx
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TYPOGRAPHY } from '@/constants/design';

export function H1({ children, style, ...rest }: TextProps) {
  const { theme } = useTheme();
  return (
    <Text style={[styles.h1, { color: theme.textDark }, style]} {...rest}>
      {children}
    </Text>
  );
}
export function H2({ children, style, ...rest }: TextProps) {
  const { theme } = useTheme();
  return (
    <Text style={[styles.h2, { color: theme.textDark }, style]} {...rest}>
      {children}
    </Text>
  );
}
export function H3({ children, style, ...rest }: TextProps) {
  const { theme } = useTheme();
  return (
    <Text style={[styles.h3, { color: theme.textDark }, style]} {...rest}>
      {children}
    </Text>
  );
}
export function Body({ children, style, ...rest }: TextProps) {
  const { theme } = useTheme();
  return (
    <Text style={[styles.body, { color: theme.textDark }, style]} {...rest}>
      {children}
    </Text>
  );
}
export function Small({ children, style, ...rest }: TextProps) {
  const { theme } = useTheme();
  return (
    <Text style={[styles.small, { color: theme.textLight }, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  h1: { ...TYPOGRAPHY.h1 },
  h2: { ...TYPOGRAPHY.h2 },
  h3: { ...TYPOGRAPHY.h3 },
  body: { ...TYPOGRAPHY.body },
  small: { ...TYPOGRAPHY.small },
});
