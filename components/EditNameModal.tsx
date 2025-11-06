// components/EditNameModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  visible: boolean;
  initialValue: string;
  title: string;
  onSave: (newName: string) => void;
  onClose: () => void;
}

export default function EditNameModal({ visible, initialValue, title, onSave, onClose }: Props) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>

          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder="Enter new name"
            placeholderTextColor={COLORS.textLight}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, { backgroundColor: COLORS.border }]}>
              <Text style={{ color: COLORS.textDark }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onSave(value.trim()); onClose(); }} style={[styles.btn, { backgroundColor: COLORS.primary }]}>
              <Text style={{ color: 'white' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 18, color: COLORS.textDark, marginBottom: 12, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    color: COLORS.textDark,
    backgroundColor: COLORS.background,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 10,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
});
