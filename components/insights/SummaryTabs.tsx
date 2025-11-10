// components/insights/SummaryTabs.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';

export default function SummaryTabs({
  activeTab,
  setActiveTab,
  transactions,
  currentMonth,
}: {
  activeTab: 'spends' | 'incoming';
  setActiveTab: (t: 'spends' | 'incoming') => void;
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

  const tabs: ('spends' | 'incoming')[] = ['spends', 'incoming'];

  return (
    <View style={styles.summaryTabs}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={[styles.tabItem, activeTab === tab && styles.activeTab]}
        >
          <Text style={styles.tabLabel}>
            {tab === 'spends' ? 'Spends' : 'Incoming'}
          </Text>
          <Text
            style={[
              styles.tabValue,
              tab === 'spends'
                ? { color: '#e63946' }
                : { color: '#2a9d8f' },
            ]}
          >
            ₹{tab === 'spends'
              ? spendsTotal.toFixed(0)
              : incomeTotal.toFixed(0)}
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
