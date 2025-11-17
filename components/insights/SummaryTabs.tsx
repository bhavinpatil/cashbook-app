// components/insights/SummaryTabs.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import dayjs, { Dayjs } from 'dayjs';
import { Transaction } from '@/types/types';
import { useTheme } from '@/contexts/ThemeContext';

const round2 = (n: number) => Number(Number(n).toFixed(2));
const fmt = (n: number) => {
  try {
    return n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return round2(n).toFixed(2);
  }
};

interface SummaryTabsProps {
  activeTab: 'spends' | 'incoming';
  setActiveTab: (t: 'spends' | 'incoming') => void;
  transactions: Transaction[];
  currentMonth: Dayjs;
}

export default function SummaryTabs({
  activeTab,
  setActiveTab,
  transactions,
  currentMonth,
}: SummaryTabsProps) {
  const { theme } = useTheme();

  const monthTx = transactions.filter(tx =>
    dayjs(tx.date).isSame(currentMonth, 'month')
  );

  // Rounded totals
  const spendsTotal = round2(
    monthTx.filter(tx => tx.type === 'debit').reduce((sum, tx) => sum + round2(tx.amount), 0)
  );

  const incomeTotal = round2(
    monthTx.filter(tx => tx.type === 'credit').reduce((sum, tx) => sum + round2(tx.amount), 0)
  );

  return (
    <View
      style={[
        styles.summaryTabs,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      {(['spends', 'incoming'] as const).map(tab => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={[
            styles.tabItem,
            activeTab === tab && { borderBottomColor: theme.primary },
          ]}
        >
          <Text style={[styles.tabLabel, { color: theme.textLight }]}>
            {tab === 'spends' ? 'Spends' : 'Incoming'}
          </Text>

          <Text
            style={[
              styles.tabValue,
              { color: tab === 'spends' ? '#e63946' : '#2a9d8f' },
            ]}
          >
            ₹{fmt(tab === 'spends' ? spendsTotal : incomeTotal)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabLabel: { fontSize: 14 },
  tabValue: { fontSize: 18, fontWeight: '700' },
});
