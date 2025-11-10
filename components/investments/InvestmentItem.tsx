// components/investments/InvestmentItem.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@/types/types';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  item: Transaction;
  onUpdated: () => void;
};

const INVESTMENT_TYPES = ['Stocks', 'Mutual Funds', 'Gold', 'Real Estate', 'Crypto', 'Other'];

export default function InvestmentItem({ item, onUpdated }: Props) {
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState(item.investmentType ?? 'Uncategorized');
  const [expanded, setExpanded] = useState(false);

  const handleTypeChange = async (newType: string) => {
    try {
      const booksData = await AsyncStorage.getItem('books');
      const books = booksData ? JSON.parse(booksData) : [];

      for (const b of books) {
        const txKey = `transactions_${b.id}`;
        const data = await AsyncStorage.getItem(txKey);
        if (data) {
          const list: Transaction[] = JSON.parse(data);
          const idx = list.findIndex(t => t.id === item.id);
          if (idx !== -1) {
            list[idx].investmentType = newType;
            await AsyncStorage.setItem(txKey, JSON.stringify(list));
            break;
          }
        }
      }
      setSelectedType(newType);
      onUpdated();
    } catch (err) {
      Alert.alert('Error', 'Failed to update investment type.');
    }
  };

  return (
    <TouchableOpacity
      onPress={() => setExpanded(prev => !prev)}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
    >
      <View>
        <Text style={[styles.desc, { color: theme.textDark }]}>
          {item.description || 'No description'}
        </Text>
        <Text style={[styles.amount, { color: theme.primary }]}>₹{item.amount}</Text>
        <Text style={[styles.date, { color: theme.textLight }]}>
          {new Date(item.date).toDateString()}
        </Text>
      </View>

      {expanded && (
        <View style={styles.pickerContainer}>
          <Text style={[styles.label, { color: theme.textLight }]}>Type:</Text>
          <Picker
            selectedValue={selectedType}
            onValueChange={handleTypeChange}
            style={{ color: theme.textDark, width: 200 }}
            dropdownIconColor={theme.textLight}
          >
            <Picker.Item label="Uncategorized" value="Uncategorized" />
            {INVESTMENT_TYPES.map(t => (
              <Picker.Item key={t} label={t} value={t} />
            ))}
          </Picker>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  desc: { fontSize: 16, fontWeight: '600' },
  amount: { fontSize: 15, fontWeight: '500', marginTop: 2 },
  date: { fontSize: 12, marginTop: 2 },
  pickerContainer: { marginTop: 8 },
  label: { fontSize: 13, marginBottom: 4 },
});
