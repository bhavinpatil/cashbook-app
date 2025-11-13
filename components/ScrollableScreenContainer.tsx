// components/ScrollableScreenContainer.tsx
import React from 'react';
import { SafeAreaView, FlatList, View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SPACING } from '@/constants/design';

export default function ScrollableScreenContainer({ children }: { children: React.ReactNode; }) {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        data={[{ key: 'content' }]}
        keyExtractor={(i) => i.key}
        renderItem={() => <View style={{ paddingHorizontal: SPACING.lg }}>{children}</View>}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
});
