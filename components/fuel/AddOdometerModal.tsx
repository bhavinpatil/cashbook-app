// components/fuel/AddOdometerModal.tsx

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (value: number) => Promise<void> | void;
  previousOdometer?: number;
};

export default function AddOdometerModal({
  visible,
  onClose,
  onSave,
  previousOdometer,
}: Props) {
  const [odometer, setOdometer] = useState('');

  const handleSave = () => {
    const val = Number(odometer);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid', 'Please enter a valid odometer value.');
      return;
    }
    if (previousOdometer && val <= previousOdometer) {
      Alert.alert(
        'Invalid Odometer',
        `Odometer must be greater than previous recorded (${previousOdometer} km).`
      );
      return;
    }
    onSave(val);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Odometer Reading</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter odometer (km)"
            keyboardType="numeric"
            value={odometer}
            onChangeText={setOdometer}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={{ color: '#333' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Text style={{ color: '#fff' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  cancelBtn: { padding: 10, marginRight: 8 },
  saveBtn: { padding: 10, backgroundColor: '#2f95dc', borderRadius: 8 },
});
