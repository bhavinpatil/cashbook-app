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

  const totals = useMemo(() => {
    let credit = 0;
    let debit = 0;
    transactions.forEach((t) => {
      if (t.type === 'Credit') credit += round2(t.amount);
      else debit += round2(t.amount);
    });
    return { credit, debit };
  }, [transactions]);

  const data = [
    {
      name: 'Credit',
      value: totals.credit,
      color: theme.success || '#4CAF50',
      legendFontColor: theme.textDark,
      legendFontSize: 13,
    },
    {
      name: 'Debit',
      value: totals.debit,
      color: theme.danger || '#F44336',
      legendFontColor: theme.textDark,
      legendFontSize: 13,
    },
  ].filter(d => d.value > 0);

  return (
    <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.textDark }]}>Credit vs Debit</Text>

      {data.length > 0 ? (
        <>
          <View style={{ alignItems: 'center' }}>
            <PieChart
              data={data.map(d => ({ name: d.name, population: d.value, color: d.color, legendFontColor: d.legendFontColor, legendFontSize: d.legendFontSize }))}
              width={Math.min(screenWidth - 80, 420)}
              height={220}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              chartConfig={{ color: () => theme.primary }}
              absolute
            />
            <View style={styles.legend}>
              {data.map((d, i) => (
                <View key={i} style={styles.legendRow}>
                  <View style={[styles.dot, { backgroundColor: d.color }]} />
                  <Text style={[styles.legendText, { color: theme.textDark }]}>
                    {d.name} — ₹{d.value.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </>
      ) : (
        <Text style={{ color: theme.textLight, textAlign: 'center' }}>No credit/debit data</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  legend: { marginTop: 8, paddingHorizontal: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: 13 },
});
