// components/ScreenContainer.tsx
import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  children: React.ReactNode;
  hasFloatingButtons?: boolean;
}

export default function ScreenContainer({ children, hasFloatingButtons = false }: Props) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            padding: 16,
            paddingBottom: hasFloatingButtons ? 100 : 40,
          },
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
});
