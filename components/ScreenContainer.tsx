// components/ScreenContainer.tsx
import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SPACING } from '@/constants/design';

export default function ScreenContainer({ children, hasFloatingButtons = false }: { children: React.ReactNode; hasFloatingButtons?: boolean; }) {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { padding: SPACING.lg, paddingBottom: hasFloatingButtons ? 120 : SPACING.xl }]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
});
