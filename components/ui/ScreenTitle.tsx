import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ScreenTitle({ children }: { children: string }) {
  const { theme } = useTheme();

  return (
    <Text style={[styles.title, { color: theme.textDark }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 4,
  },
});
