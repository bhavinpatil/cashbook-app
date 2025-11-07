// app/transactions/components/TransactionList.tsx
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Transaction } from '@/types/types';
import { COLORS } from '../../constants/theme';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (tx: Transaction) => void;
}

export default function TransactionList({ transactions, onDelete, onEdit }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered list based on search query
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const lower = searchQuery.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.description?.toLowerCase().includes(lower) ||
        tx.category?.toLowerCase().includes(lower)
    );
  }, [transactions, searchQuery]);

  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      onPress={() => onEdit(item)} // 👈 handle edit tap
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.item,
          { borderLeftColor: item.type === 'credit' ? COLORS.success : COLORS.danger },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.desc}>{item.description || '(No description)'}</Text>
          <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 2 }}>
            {item.category || 'No category'}
          </Text>
          <Text style={styles.date}>
            {dayjs(item.date).format('DD MMM YYYY · hh:mm A')}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={[
              styles.amount,
              { color: item.type === 'credit' ? COLORS.success : COLORS.danger },
            ]}
          >
            {item.type === 'credit' ? '+' : '-'} ₹{item.amount}
          </Text>
          <TouchableOpacity onPress={() => onDelete(item.id)}>
            <Text style={styles.delete}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* 🔍 Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by description or category..."
        placeholderTextColor={COLORS.textLight}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 80 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.textLight }}>
            No transactions yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    color: COLORS.textDark,
  },
  item: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 5,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  desc: { fontSize: 16, color: COLORS.textDark },
  date: { fontSize: 12, color: COLORS.textLight, marginTop: 3 },
  amount: { fontSize: 16, fontWeight: '600', marginLeft: 10 },
  delete: { fontSize: 12, color: COLORS.danger, marginTop: 6 },
});

function onEdit(item: Transaction): void {
  throw new Error('Function not implemented.');
}

