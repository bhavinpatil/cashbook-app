// components/ScreenContainer.tsx
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
  scrollable?: boolean; // <- allow toggle
}

export default function ScreenContainer({ children, scrollable = true }: Props) {
  const { theme } = useTheme() || {};
  const insets = useSafeAreaInsets();
  const background = theme?.background || COLORS.background;

  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { backgroundColor: background, paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]}>
      <View
        style={[
          styles.container,
          { backgroundColor: background, paddingBottom: insets.bottom + 90 },
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
