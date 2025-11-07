// components/CustomButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
}

export default function CustomButton({
  title,
  onPress,
  type = 'primary',
  style,
  disabled = false,
  loading = false,
}: CustomButtonProps) {
  const { theme } = useTheme() || {};
  const activeTheme = theme || COLORS;

  const getButtonStyle = () => {
    switch (type) {
      case 'outline':
        return [styles.button, { borderColor: activeTheme.primary, borderWidth: 1 }];
      case 'secondary':
        return [styles.button, { backgroundColor: activeTheme.card }];
      default:
        return [styles.button, { backgroundColor: activeTheme.primary }];
    }
  };

  const textColor =
    type === 'outline'
      ? activeTheme.primary
      : type === 'secondary'
      ? activeTheme.textDark
      : 'white';

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style, disabled && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
