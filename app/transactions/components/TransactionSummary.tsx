// app/transactions/components/TransactionSummary.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/theme';

interface Props {
  totalCredit: number;
  totalDebit: number;
  balance: number;
}

export default function TransactionSummary({ totalCredit, totalDebit, balance }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Total Credit</Text>
          <Text style={[styles.value, { color: COLORS.success }]}>₹{totalCredit.toFixed(2)}</Text>
        </View>
        <View>
          <Text style={styles.label}>Total Debit</Text>
          <Text style={[styles.value, { color: COLORS.danger }]}>₹{totalDebit.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.label}>Balance</Text>
        <Text
          style={[
            styles.value,
            { color: balance >= 0 ? COLORS.success : COLORS.danger, fontSize: 22 },
          ]}
        >
          ₹{balance.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceCard: {
    marginTop: 16,
    alignItems: 'center',
  },
});
