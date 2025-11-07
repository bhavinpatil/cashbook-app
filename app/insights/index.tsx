import { useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTransactions } from '@/hooks/useTransactions';
import Header from '@/components/insights/Header';
import IncomingChart from '@/components/insights/IncomingChart';
import SpendsChart from '@/components/insights/SpendsChart';
import SummaryTabs from '@/components/insights/SummaryTabs';

export default function InsightsScreen() {
  const route = useRoute();
  const { bookId, bookName } = (route.params as { bookId?: string; bookName?: string }) || {};
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [activeTab, setActiveTab] = useState<'spends' | 'invested' | 'incoming'>('spends');

  const { transactions, loading } = useTransactions(bookId || '');

  if (!bookId)
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#222', fontSize: 16 }}>No book selected</Text>
      </View>
    );

  if (loading)
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#222' }}>Loading...</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Header currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
      <SummaryTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        transactions={transactions}
        currentMonth={currentMonth}
      />

      {activeTab === 'spends' && (
        <SpendsChart transactions={transactions} currentMonth={currentMonth} bookId={bookId} />
      )}

      {activeTab === 'incoming' && (
        <IncomingChart transactions={transactions} currentMonth={currentMonth} />
      )}

      {activeTab === 'invested' && (
        <View style={{ alignItems: 'center', marginTop: 50 }}>
          <Text style={{ color: '#555' }}>Invested chart coming soon...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
