// components/settings/AddBookModal.tsx
import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import BaseModal from '@/components/ui/BaseModal';
import CustomButton from '@/components/CustomButton';
import { useTheme } from '@/contexts/ThemeContext';
import { Business } from '@/types/types';
import { SPACING, RADIUS } from '@/constants/design';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, businessId: string) => void;
  value: string;
  setValue: (text: string) => void;
  selectedBusiness: string;
  setSelectedBusiness: (id: string) => void;
  businesses: Business[];
}

export default function AddBookModal({ visible, onClose, onSave, value, setValue, selectedBusiness, setSelectedBusiness, businesses }: Props) {
  const { theme } = useTheme();

  return (
    <BaseModal visible={visible} title="Add New Book" onClose={onClose}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textLight }]}>Book name</Text>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="e.g. Personal Wallet"
          placeholderTextColor={theme.textLight}
          style={[styles.input, { backgroundColor: theme.background, color: theme.textDark, borderColor: theme.border }]}
        />
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textLight }]}>Select Business</Text>
        <Picker selectedValue={selectedBusiness} onValueChange={setSelectedBusiness} style={[styles.input, { backgroundColor: theme.background, color: theme.textDark }]}>
          <Picker.Item label="Select Business" value="" />
          {businesses.map((b) => <Picker.Item key={b.id} label={b.name} value={b.id} />)}
        </Picker>
      </View>

      <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md }}>
        <CustomButton title="Cancel" type="secondary" onPress={onClose} style={{ flex: 1 }} />
        <CustomButton title="Save" onPress={() => onSave(value, selectedBusiness)} style={{ flex: 1 }} />
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: SPACING.md },
  label: { fontSize: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: RADIUS.sm, padding: SPACING.sm },
});
