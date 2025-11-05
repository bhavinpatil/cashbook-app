// components/ScreenContainer.tsx
import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  children: React.ReactNode;
}

export default function ScreenContainer({ children }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
