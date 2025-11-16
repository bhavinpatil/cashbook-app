// components/investments/AddInvestmentModal.tsx
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Investment, InvestmentType } from '@/hooks/useInvestmentsStore';

type Props = {
  visible: boolean;
  initial?: Investment | null;
  onClose: () => void;
  onSave: (payload: Omit<Investment, 'id'> | Investment) => Promise<void> | void;
};

const TYPES: InvestmentType[] = [
  'Stocks',
  'Mutual Funds',
  'Gold',
  'Bonds',
  'FD',
  'ETF',
  'Crypto',
  'Real Estate',
  'Other',
];

export default function AddInvestmentModal({ visible, initial = null, onClose, onSave }: Props) {
  const { theme } = useTheme();
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState<InvestmentType>('Stocks');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [units, setUnits] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initial) {
      setDate(new Date(initial.date));
      setType(initial.type);
      setDescription(initial.description || '');
      setAmount(String(initial.amount || ''));
      setUnits(initial.units != null ? String(initial.units) : '');
      setPricePerUnit(initial.pricePerUnit != null ? String(initial.pricePerUnit) : '');
      setNotes(initial.notes || '');
    } else {
      setDate(new Date());
      setType('Stocks');
      setDescription('');
      setAmount('');
      setUnits('');
      setPricePerUnit('');
      setNotes('');
    }
  }, [visible, initial]);

  const validateAndSave = () => {
    const amt = Number(amount || 0);
    const u = units ? Number(units) : undefined;
    const p = pricePerUnit ? Number(pricePerUnit) : undefined;
    if ((!amt || amt <= 0) && !(u && p && u > 0 && p > 0)) {
      Alert.alert('Validation', 'Please provide an amount or units & price per unit.');
      return;
    }
    const payload: any = {
      date: date.toISOString(),
      type,
      description: description.trim(),
      amount: amt || (u && p ? u * p : 0),
      units: u,
      pricePerUnit: p,
      notes: notes.trim(),
    };
    onSave(initial ? { ...initial, ...payload } : payload);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.textDark }]}>{initial ? 'Edit Investment' : 'Add Investment'}</Text>

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.fieldRow}>
            <Text style={[styles.label, { color: theme.textLight }]}>Date</Text>
            <Text style={[styles.value, { color: theme.textDark }]}>{date.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(_, d) => {
                setShowDatePicker(false);
                if (d) setDate(d);
              }}
            />
          )}

          <View style={styles.fieldRow}>
            <View style={[styles.select, { borderColor: theme.border, backgroundColor: theme.background }]}>
              <View style={{ marginBottom: 8 }}>
                <Text style={[styles.label, { color: theme.textLight, marginBottom: 6 }]}>Type</Text>
                <View style={styles.typeGrid}>
                  {TYPES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setType(t)}
                      style={[
                        styles.typeOption,
                        {
                          backgroundColor: type === t ? theme.primary : theme.background,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Text style={{ color: type === t ? '#fff' : theme.textDark }}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <TextInput
            placeholder="Description (optional)"
            placeholderTextColor={theme.textLight}
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { borderColor: theme.border, color: theme.textDark, backgroundColor: theme.background }]}
          />

          <TextInput
            placeholder="Amount (₹)"
            placeholderTextColor={theme.textLight}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={[styles.input, { borderColor: theme.border, color: theme.textDark, backgroundColor: theme.background }]}
          />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              placeholder="Units (optional)"
              placeholderTextColor={theme.textLight}
              value={units}
              onChangeText={setUnits}
              keyboardType="numeric"
              style={[styles.input, { flex: 1, borderColor: theme.border, color: theme.textDark, backgroundColor: theme.background }]}
            />
            <TextInput
              placeholder="Price / unit (optional)"
              placeholderTextColor={theme.textLight}
              value={pricePerUnit}
              onChangeText={setPricePerUnit}
              keyboardType="numeric"
              style={[styles.input, { flex: 1, borderColor: theme.border, color: theme.textDark, backgroundColor: theme.background }]}
            />
          </View>

          <TextInput
            placeholder="Notes (optional)"
            placeholderTextColor={theme.textLight}
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, { borderColor: theme.border, color: theme.textDark, backgroundColor: theme.background }]}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, { borderColor: theme.border }]}>
              <Text style={{ color: theme.textDark }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={validateAndSave} style={[styles.btnPrimary, { backgroundColor: theme.primary }]}>
              <Text style={{ color: '#fff' }}>{initial ? 'Update' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: { width: '100%', borderRadius: 12, padding: 14, borderWidth: 1, elevation: 8 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 13 },
  value: { fontSize: 14 },
  select: { padding: 6, borderRadius: 8 },
  typeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 8, fontSize: 14 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  btnPrimary: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },

});
