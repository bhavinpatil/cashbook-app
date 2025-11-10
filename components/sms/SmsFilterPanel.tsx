// components/sms/SmsFilterPanel.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

export default function SmsFilterPanel({ onApply }: { onApply: (f: any) => void }) {
  const { theme } = useTheme();
  const [type, setType] = useState<'All' | 'Credit' | 'Debit'>('All');
  const [sort, setSort] = useState<'Date' | 'Amount'>('Date');
  const [category, setCategory] = useState<string>('All');

  const apply = () => onApply({ type, sort, category });

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textDark }]}>Type:</Text>
        {['All', 'Credit', 'Debit'].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setType(t as any)}
            style={[
              styles.option,
              { backgroundColor: type === t ? theme.primary : 'transparent', borderColor: theme.border },
            ]}
          >
            <Text style={{ color: type === t ? '#fff' : theme.textDark }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textDark }]}>Sort by:</Text>
        {['Date', 'Amount'].map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSort(s as any)}
            style={[
              styles.option,
              { backgroundColor: sort === s ? theme.primary : 'transparent', borderColor: theme.border },
            ]}
          >
            <Text style={{ color: sort === s ? '#fff' : theme.textDark }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={apply} style={[styles.applyBtn, { backgroundColor: theme.primary }]}>
        <Ionicons name="filter" size={18} color="#fff" />
        <Text style={styles.applyText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 },
  label: { fontWeight: '600', width: 70 },
  option: { borderWidth: 1, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  applyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10, padding: 8, marginTop: 6 },
  applyText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
});
