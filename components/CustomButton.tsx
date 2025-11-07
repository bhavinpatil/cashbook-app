import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline' | 'danger' | 'small';
  style?: ViewStyle | ViewStyle[];
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
  const { theme } = useTheme();

  const backgroundColor =
    type === 'primary'
      ? theme.primary
      : type === 'danger'
      ? theme.danger
      : type === 'secondary'
      ? theme.card
      : 'transparent';

  const borderColor =
    type === 'outline' ? theme.primary : 'transparent';

  const textColor =
    type === 'primary' || type === 'danger'
      ? 'white'
      : theme.textDark;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        type === 'small' && styles.smallButton,
        { backgroundColor, borderColor },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            styles.text,
            type === 'small' && { fontSize: 14 },
            { color: textColor },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
