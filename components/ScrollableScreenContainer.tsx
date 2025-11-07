// components/ScrollableScreenContainer.tsx
import React from 'react';
import { SafeAreaView, FlatList, StyleSheet, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  children: React.ReactNode;
}

export default function ScrollableScreenContainer({ children }: Props) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        data={[{ key: 'content' }]}
        keyExtractor={(item) => item.key}
        renderItem={() => <View>{children}</View>} // ✅ wrapped inside <View>
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          paddingBottom: 120, // extra space for bottom tab
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
});
