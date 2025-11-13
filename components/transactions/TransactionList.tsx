// app/transactions/components/TransactionList.tsx
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Transaction } from '@/types/types';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (tx: Transaction) => void;
}

export default function TransactionList({ transactions, onDelete, onEdit }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();

  /** 🔍 Search filter */
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const lower = searchQuery.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.description?.toLowerCase().includes(lower) ||
        tx.category?.toLowerCase().includes(lower)
    );
  }, [transactions, searchQuery]);

  /** 🎨 Single transaction card */
  const renderItem = ({ item }: { item: Transaction }) => {
    const amountColor = item.type === 'credit' ? theme.success : theme.danger;

    return (
      <TouchableOpacity onPress={() => onEdit(item)} activeOpacity={0.85}>
        <View
          style={[
            styles.item,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderLeftColor: amountColor,
            },
          ]}
        >
          {/* LEFT */}
          <View style={{ flex: 1 }}>
            <Text style={[styles.desc, { color: theme.textDark }]}>
              {item.description || '(No description)'}
            </Text>

            <Text style={{ fontSize: 12, color: theme.textLight, marginTop: 3 }}>
              {item.category || 'No category'}
            </Text>

            <Text style={[styles.date, { color: theme.textLight }]}>
              {dayjs(item.date).format('DD MMM YYYY · hh:mm A')}
            </Text>
          </View>

          {/* RIGHT */}
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.amount, { color: amountColor }]}>
              {item.type === 'credit' ? '+' : '-'} ₹{item.amount}
            </Text>

            <TouchableOpacity onPress={() => onDelete(item.id)}>
              <Text style={[styles.delete, { color: theme.danger }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 🔍 Search bar */}
      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: theme.inputBg || theme.card,
            borderColor: theme.border,
            color: theme.textDark,
          },
        ]}
        placeholder="Search by description or category..."
        placeholderTextColor={theme.textLight}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: 'center',
              marginTop: 40,
              color: theme.textLight,
              fontSize: 14,
            }}
          >
            No transactions yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
    marginBottom: 12,
  },

  item: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 6,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',

    // subtle elevation
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  desc: {
    fontSize: 16,
    fontWeight: '600',
  },

  date: {
    fontSize: 12,
    marginTop: 3,
  },

  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },

  delete: {
    fontSize: 12,
  },
});
