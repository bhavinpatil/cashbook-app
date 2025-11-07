// components/CustomEditButton.tsx
import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomEditButtonProps {
  title?: string;
  onPress: () => void;
  type?: 'edit' | 'delete' | 'info';
  style?: ViewStyle | ViewStyle[];
}

export default function CustomEditButton({
  title,
  onPress,
  type = 'edit',
  style,
}: CustomEditButtonProps) {
  const { theme } = useTheme();

  const getColors = () => {
    switch (type) {
      case 'delete':
        return { bg: theme.danger, text: '#fff' };
      case 'info':
        return { bg: theme.primary, text: '#fff' };
      default:
        return {
          bg: theme.card,
          text: theme.textDark,
          border: theme.border,
        };
    }
  };

  const { bg, text, border } = getColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: border },
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
        style,
      ]}
    >
      <Text style={[styles.text, { color: text }]}>
        {title || (type === 'delete' ? 'Delete' : 'Edit')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
