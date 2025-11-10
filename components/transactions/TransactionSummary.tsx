// components/transactions/TransactionSummary.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  totalCredit: number;
  totalDebit: number;
  balance: number;
  onViewInsights: () => void;
}

export default function TransactionSummary({
  totalCredit,
  totalDebit,
  balance,
  onViewInsights,
}: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      {/* Credit / Debit Section */}
      <View style={styles.row}>
        <View>
          <Text style={[styles.label, { color: theme.textLight }]}>Total Credit</Text>
          <Text style={[styles.value, { color: theme.success }]}>
            ₹{totalCredit.toFixed(2)}
          </Text>
        </View>
        <View>
          <Text style={[styles.label, { color: theme.textLight }]}>Total Debit</Text>
          <Text style={[styles.value, { color: theme.danger }]}>
            ₹{totalDebit.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Balance Section */}
      <View style={styles.balanceCard}>
        <Text style={[styles.label, { color: theme.textLight }]}>Balance</Text>
        <Text
          style={[
            styles.value,
            {
              color: balance >= 0 ? theme.success : theme.danger,
              fontSize: 22,
            },
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
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceCard: {
    marginTop: 16,
    alignItems: 'center',
  },
  insightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 3,
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  insightText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
