// app/transactions/components/TransactionList.tsx
import React from 'react';
import { FlatList, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { COLORS } from '../../../constants/theme';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, onDelete }: Props) {
  const renderItem = ({ item }: { item: Transaction }) => (
    <View
      style={[
        styles.item,
        { borderLeftColor: item.type === 'credit' ? COLORS.success : COLORS.danger },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.desc}>{item.description || '(No description)'}</Text>
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
  );

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ gap: 10, paddingBottom: 80 }}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.textLight }}>
          No transactions yet.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
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
