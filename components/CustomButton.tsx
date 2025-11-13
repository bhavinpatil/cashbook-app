// components/CustomButton.tsx
import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOW } from '@/constants/design';

interface Props {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline' | 'danger' | 'small';
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
  loading?: boolean;
  textColor?: string;
}

export default function CustomButton({
  title,
  onPress,
  type = 'primary',
  style,
  disabled = false,
  loading = false,
  textColor,
}: Props) {
  const { theme } = useTheme();

  const stylesForType = {
    backgroundColor:
      type === 'primary' ? theme.primary :
        type === 'danger' ? theme.danger :
          type === 'secondary' ? theme.card : 'transparent',
    borderColor: type === 'outline' ? theme.primary : 'transparent',
    textColor:
      textColor ??
      (type === 'primary' || type === 'danger' ? '#fff' : theme.textDark),
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        baseStyles.button,
        {
          backgroundColor: stylesForType.backgroundColor,
          borderColor: stylesForType.borderColor,
          borderRadius: RADIUS.md,
          paddingVertical: type === 'small' ? 8 : 12,
        },
        SHADOW.soft,
        pressed && { opacity: 0.9, transform: [{ scale: 0.995 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={stylesForType.textColor} />
      ) : (
        <Text style={[baseStyles.text, { color: stylesForType.textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const baseStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    width: '100%',
  },
  text: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
});
