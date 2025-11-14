// components/InputField.tsx

import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface InputFieldProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: TextInput["props"]["style"];
  secureTextEntry?: boolean;
}

export default function InputField({
  placeholder,
  value,
  onChangeText,
  style,
  secureTextEntry = false,
}: InputFieldProps) {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      placeholderTextColor={COLORS.textLight}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
    color: COLORS.textDark,
    backgroundColor: COLORS.card,
  },
});
