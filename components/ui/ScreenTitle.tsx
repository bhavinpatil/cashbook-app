// components/ui/ScreenTitle.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { H2 } from './Typography';

export default function ScreenTitle({ children }: { children: string }) {
  return <H2 style={styles.title}>{children}</H2>;
}

const styles = StyleSheet.create({
  title: {
    marginTop: 0,
    marginBottom: 12,
  },
});
