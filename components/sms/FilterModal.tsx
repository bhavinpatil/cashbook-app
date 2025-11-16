import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

type Filters = {
  type?: 'All' | 'Credit' | 'Debit';
  sort?: 'Date' | 'Amount';
};

export default function FilterModal({
  visible,
  onClose,
  onApply,
  initial,
}: {
  visible: boolean;
  onClose: () => void;
  onApply: (f: Filters) => void;
  initial?: Filters;
}) {
  const { theme } = useTheme();

  const [type, setType] = useState<Filters['type']>('All');
  const [sort, setSort] = useState<Filters['sort']>('Date');

  useEffect(() => {
    if (initial) {
      setType(initial.type ?? 'All');
      setSort(initial.sort ?? 'Date');
    }
  }, [initial, visible]);

  const apply = () => {
    onApply({ type, sort });
    onClose();
  };

  const Radio = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.radioRow} onPress={onPress}>
      <View
        style={[
          styles.radioOuter,
          { borderColor: selected ? theme.primary : theme.border },
        ]}
      >
        {selected && <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />}
      </View>
      <Text style={[styles.radioLabel, { color: theme.textDark }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.textDark }]}>Filters</Text>

          {/* Type */}
          <Text style={[styles.section, { color: theme.textDark }]}>Type</Text>
          <Radio label="All" selected={type === 'All'} onPress={() => setType('All')} />
          <Radio label="Credit" selected={type === 'Credit'} onPress={() => setType('Credit')} />
          <Radio label="Debit" selected={type === 'Debit'} onPress={() => setType('Debit')} />

          {/* Sort */}
          <Text style={[styles.section, { color: theme.textDark }]}>Sort By</Text>
          <Radio label="Date" selected={sort === 'Date'} onPress={() => setSort('Date')} />
          <Radio label="Amount" selected={sort === 'Amount'} onPress={() => setSort('Amount')} />

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, { borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={{ color: theme.textDark, fontWeight: '600' }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.primary }]}
              onPress={apply}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Apply</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  section: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 4,
    fontWeight: '600',
  },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 6 },
  radioLabel: { fontSize: 14 },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
});
