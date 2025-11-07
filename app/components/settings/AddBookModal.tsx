import React from 'react';
import { View, Text, TextInput, Modal, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomButton from '../../../components/CustomButton';
import { useTheme } from '../../../contexts/ThemeContext';
import { Business } from '../../types/types';

interface AddBookModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, businessId: string) => void;
  value: string;
  setValue: (text: string) => void;
  selectedBusiness: string;
  setSelectedBusiness: (id: string) => void;
  businesses: Business[];
}

export default function AddBookModal({
  visible,
  onClose,
  onSave,
  value,
  setValue,
  selectedBusiness,
  setSelectedBusiness,
  businesses,
}: AddBookModalProps) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.textDark }]}>Add New Book</Text>

          <TextInput
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.textDark, backgroundColor: theme.background },
            ]}
            placeholder="Book Name"
            placeholderTextColor={theme.textLight}
            value={value}
            onChangeText={setValue}
          />

          <Text style={{ marginBottom: 6, color: theme.textLight }}>Select Business:</Text>
          <Picker
            selectedValue={selectedBusiness}
            style={[styles.input, { backgroundColor: theme.background, color: theme.textDark }]}
            onValueChange={setSelectedBusiness}
          >
            <Picker.Item label="Select Business" value="" />
            {businesses.map((b) => (
              <Picker.Item key={b.id} label={b.name} value={b.id} />
            ))}
          </Picker>

          <View style={styles.actions}>
            <CustomButton title="Cancel" type="secondary" onPress={onClose} style={{ flex: 1 }} />
            <CustomButton
              title="Save"
              onPress={() => onSave(value, selectedBusiness)}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
});
