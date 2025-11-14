// app/insights/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '@/components/insights/Header';
import IncomingChart from '@/components/insights/IncomingChart';
import SpendsChart from '@/components/insights/SpendsChart';
import SummaryTabs from '@/components/insights/SummaryTabs';
import { Transaction } from '@/types/types';
import { useSmartReload } from '@/hooks/useSmartReload';
import ScreenTitle from '@/components/ui/ScreenTitle';
import { useTheme } from '@/contexts/ThemeContext';

export default function InsightsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [activeTab, setActiveTab] = useState<'spends' | 'incoming'>('spends');
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();

  const loadAllTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const booksData = await AsyncStorage.getItem('books');
      const books = booksData ? JSON.parse(booksData) : [];

      let allTransactions: Transaction[] = [];

      for (const book of books) {
        const data = await AsyncStorage.getItem(`transactions_${book.id}`);
        if (data) {
          const parsed: Transaction[] = JSON.parse(data);
          allTransactions = [...allTransactions, ...parsed];
        }
      }

      const filtered = allTransactions.filter((tx) =>
        dayjs(tx.date).isSame(currentMonth, 'month')
      );

      setTransactions(filtered);
    } catch (err) {
      console.error('Error loading transactions for insights:', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useSmartReload('transactions', loadAllTransactions, [currentMonth]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textDark }}>Loading Insights...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <ScreenTitle>Analytics</ScreenTitle>

      <Header currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />

      <SummaryTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        transactions={transactions}
        currentMonth={currentMonth}
      />

      {activeTab === 'spends' && (
        <SpendsChart transactions={transactions} currentMonth={currentMonth} />
      )}

      {activeTab === 'incoming' && (
        <IncomingChart transactions={transactions} currentMonth={currentMonth} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
