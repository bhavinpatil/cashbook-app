// app/insights/components/SummaryTabs.tsx

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';

export default function SummaryTabs({
  activeTab,
  setActiveTab,
  transactions,
  currentMonth,
}: {
  activeTab: 'spends' | 'invested' | 'incoming';
  setActiveTab: (t: 'spends' | 'invested' | 'incoming') => void;
  transactions: any[];
  currentMonth: dayjs.Dayjs;
}) {
  const monthTx = transactions.filter(tx => dayjs(tx.date).isSame(currentMonth, 'month'));
  const spendsTotal = monthTx
    .filter(tx => tx.type === 'debit')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const incomeTotal = monthTx
    .filter(tx => tx.type === 'credit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <View style={styles.summaryTabs}>
      {['spends', 'invested', 'incoming'].map(tab => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab as any)}
          style={[styles.tabItem, activeTab === tab && styles.activeTab]}
        >
          <Text style={styles.tabLabel}>
            {tab === 'spends' ? 'Spends' : tab === 'invested' ? 'Invested' : 'Incoming'}
          </Text>
          <Text
            style={[
              styles.tabValue,
              tab === 'spends'
                ? { color: '#e63946' }
                : tab === 'incoming'
                ? { color: '#2a9d8f' }
                : {},
            ]}
          >
            ₹
            {tab === 'spends'
              ? spendsTotal.toFixed(0)
              : tab === 'incoming'
              ? incomeTotal.toFixed(0)
              : '0'}
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
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    paddingVertical: 12,
    marginBottom: 20,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#111' },
  tabLabel: { fontSize: 14, color: '#666' },
  tabValue: { fontSize: 18, fontWeight: '700', color: '#111' },
});
