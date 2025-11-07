
// components/fuel/AddFuelModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export type FuelEntryInput = {
  id?: string;
  date: string;
  amount: number;
  liters: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: FuelEntryInput) => Promise<void> | void;
};

export default function AddFuelModal({ visible, onClose, onSave }: Props) {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [liters, setLiters] = useState<string>('');

  useEffect(() => {
    if (visible) {
      setDate(new Date());
      setAmount('');
      setLiters('');
    }
  }, [visible]);

  const handleSave = () => {
    const amt = Number(amount);
    const ltr = Number(liters);

    if (isNaN(amt) || amt <= 0) {
      alert('Please enter valid amount (₹).');
      return;
    }
    if (isNaN(ltr) || ltr <= 0) {
      alert('Please enter valid liters value.');
      return;
    }

    onSave({
      id: String(Date.now()),
      date: date.toISOString(),
      amount: amt,
      liters: ltr,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Fuel</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.dateRow}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{date.toDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(_, selected) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selected) setDate(selected);
              }}
            />
          )}

          <View style={styles.inputRow}>
            <Text style={styles.label}>Amount (₹)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="e.g. 315"
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>Liters (L)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={liters}
              onChangeText={setLiters}
              placeholder="e.g. 3.03"
            />
          </View>

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
  dateRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14 },
  inputRow: { marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: { padding: 10, marginRight: 8 },
  saveBtn: { padding: 10, backgroundColor: '#2f95dc', borderRadius: 8 },
});
