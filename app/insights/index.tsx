import React from 'react';
import { ScrollView, Dimensions, Text, View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTransactions } from '../transactions/hooks/useTransactions';
import { useInsights } from '../transactions/hooks/useInsights';
import { BarChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const route = useRoute();
  const { bookId, bookName } = (route.params as { bookId?: string; bookName?: string }) || {};

  if (!bookId) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#222', fontSize: 16 }}>No book selected</Text>
      </View>
    );
  }

  const { transactions, loading } = useTransactions(bookId);
  const { getCategoryData, getMonthlyData, getBalanceTrend } = useInsights(transactions);

  if (loading)
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#222' }}>Loading...</Text>
      </View>
    );

  const { labels, creditData, debitData } = getMonthlyData();
  const balanceTrend = getBalanceTrend();

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#f9f9f9',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(30, 30, 30, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
    style: { borderRadius: 12 },
    propsForBackgroundLines: { strokeDasharray: '' },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.title}>Insights — {bookName || 'Selected Book'}</Text>

      {/* 📊 Monthly Bar Chart */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Monthly Credit vs Debit</Text>
        {labels.length > 0 ? (
          <BarChart
            data={{
              labels,
              datasets: [
                { data: creditData },
                { data: debitData },
              ],
            }}
            width={screenWidth - 40}
            height={250}
            yAxisLabel="₹"
            yAxisSuffix=""
            fromZero
            chartConfig={chartConfig}
            verticalLabelRotation={30}
          />
        ) : (
          <Text style={styles.placeholder}>No monthly data available</Text>
        )}
      </View>

      {/* 📈 Balance Trend */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Balance Trend</Text>
        {balanceTrend.length > 0 ? (
          <LineChart
            data={{
              labels: balanceTrend.map((b) =>
                new Date(b.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
              ),
              datasets: [{ data: balanceTrend.map((b) => b.balance) }],
            }}
            width={screenWidth - 40}
            height={220}
            yAxisLabel="₹"
            fromZero
            chartConfig={chartConfig}
            bezier
          />
        ) : (
          <Text style={styles.placeholder}>No trend data available</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7', // ✅ Light background for readability
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  placeholder: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
  },
});
