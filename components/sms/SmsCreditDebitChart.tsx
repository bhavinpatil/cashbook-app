// components/sms/SmsCreditDebitChart.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '@/contexts/ThemeContext';
import type { SmsTransaction } from '@/types/sms';

const screenWidth = Dimensions.get('window').width;
const round2 = (n: number) => Number(Number(n).toFixed(2));

export default function SmsCreditDebitChart({ transactions }: { transactions: SmsTransaction[] }) {
  const { theme } = useTheme();

  // Calculate totals
  const totals = useMemo(() => {
    let credit = 0;
    let debit = 0;

    transactions.forEach((t) => {
      if (t.type === 'Credit') credit += round2(t.amount);
      else debit += round2(t.amount);
    });

    const balance = round2(credit - debit);
    return { credit: round2(credit), debit: round2(debit), balance };
  }, [transactions]);

  const { credit, debit, balance } = totals;

  // Use only two values for pie chart:
  const chartData = [
    {
      name: 'Spent',
      population: debit,
      color: theme.danger || '#F44336',
      legendFontColor: theme.textDark,
      legendFontSize: 14,
    },
    {
      name: 'Remaining',
      population: balance < 0 ? 0 : balance, // prevent negative slice
      color: theme.success || '#4CAF50',
      legendFontColor: theme.textDark,
      legendFontSize: 14,
    },
  ].filter((d) => d.population > 0);

  const fmt = (v: number) =>
    v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.card }]}>

      {/* Header hybrid summary */}
      <Text style={[styles.headerText, { color: theme.textLight }]}>
        Total Income — <Text style={{ color: theme.primary, fontWeight: '700' }}>₹{fmt(credit)}</Text>
      </Text>

      <Text style={[styles.title, { color: theme.textDark }]}>Spent vs Remaining</Text>

      {chartData.length > 0 ? (
        <View style={{ alignItems: 'center' }}>

          {/* Pie Chart */}
          <PieChart
            data={chartData}
            width={Math.min(screenWidth - 80, 420)}
            height={220}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="0"
            chartConfig={{ color: () => theme.primary }}
            absolute
          />

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: theme.danger }]} />
              <Text style={[styles.legendText, { color: theme.textDark }]}>
                Spent — ₹{fmt(debit)}
              </Text>
            </View>

            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: theme.success }]} />
              <Text style={[styles.legendText, { color: theme.textDark }]}>
                Remaining — ₹{fmt(balance)}
              </Text>
            </View>
          </View>

        </View>
      ) : (
        <Text style={{ color: theme.textLight, textAlign: 'center' }}>
          No SMS data found
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  headerText: { fontSize: 14, textAlign: 'center', marginBottom: 4 },
  legend: { marginTop: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, justifyContent: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: 14, fontWeight: '500' },
});
