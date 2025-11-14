// components/settings/AddBusinessModal.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import BaseModal from '@/components/ui/BaseModal';
import CustomButton from '@/components/CustomButton';
import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, RADIUS } from '@/constants/design';

export default function AddBusinessModal({ visible, onClose, onSave, value, setValue }: any) {
  const { theme } = useTheme();

  return (
    <BaseModal visible={visible} title="Add New Business" onClose={onClose}>
      <View style={{ marginBottom: SPACING.md }}>
        <Text style={[{ color: theme.textLight, marginBottom: 6 }]}>Business Name</Text>
        <TextInput
          placeholder="e.g. My Side Hustle"
          placeholderTextColor={theme.textLight}
          value={value}
          onChangeText={setValue}
          style={[styles.input, { borderColor: theme.border, color: theme.textDark, backgroundColor: theme.background }]}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
        <CustomButton title="Cancel" type="secondary" onPress={onClose} style={{ flex: 1 }} />
        <CustomButton title="Save" onPress={() => onSave(value)} style={{ flex: 1 }} />
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: RADIUS.sm, padding: SPACING.sm },
});
