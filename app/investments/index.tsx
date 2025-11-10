// app/investments/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { Transaction } from '@/types/types';
import InvestmentItem from '@/components/investments/InvestmentItem';
import InvestmentChart from '@/components/insights/InvestmentChart'; // ✅ Import new chart component
import { useTheme } from '@/contexts/ThemeContext';

export default function InvestmentsScreen() {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reload, setReload] = useState(false);

  const loadTransactions = async () => {
    const booksData = await AsyncStorage.getItem('books');
    const books = booksData ? JSON.parse(booksData) : [];
    let all: Transaction[] = [];
    for (const b of books) {
      const data = await AsyncStorage.getItem(`transactions_${b.id}`);
      if (data) all = [...all, ...JSON.parse(data)];
    }
    const filtered = all.filter(tx => tx.category?.toLowerCase() === 'investment');
    setTransactions(filtered);
  };

  useEffect(() => {
    loadTransactions();
  }, [reload]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <Text style={[styles.header, { color: theme.textDark }]}>💹 Investments</Text>

      {/* List of Investment Transactions */}
      {transactions.length ? (
        <View style={styles.listContainer}>
          {transactions.map(tx => (
            <InvestmentItem key={tx.id} item={tx} onUpdated={() => setReload(!reload)} />
          ))}
        </View>
      ) : (
        <View style={styles.centered}>
          <Text style={{ color: theme.textLight }}>No investment transactions found.</Text>
        </View>
      )}

      {/* 📊 Improved Chart Section */}
      {transactions.length > 0 && <InvestmentChart transactions={transactions} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  listContainer: { marginBottom: 20 },
  centered: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
});
