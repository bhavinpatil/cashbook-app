// components/investments/InvestmentGraph.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '@/contexts/ThemeContext';
import dayjs from 'dayjs';
import { Investment } from '@/hooks/useInvestmentsStore';

const screenWidth = Dimensions.get('window').width;

export default function InvestmentGraph({
  all,
  month,
  monthlyTrend,
}: {
  all: Investment[];
  month: Investment[];
  monthlyTrend: { labels: string[]; values: number[] };
}) {
  const { theme } = useTheme();
  const [isDaily, setIsDaily] = useState(true);

  // ---------------- Daily Cumulative Chart ----------------
  const monthDate = month.length ? dayjs(month[0].date) : dayjs();
  const daysInMonth = monthDate.daysInMonth();
  const today = dayjs();
  const visibleDays = today.isSame(monthDate, 'month') ? today.date() : daysInMonth;

  const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

  const dailyData = useMemo(() => {
    const arr = Array(daysInMonth).fill(0);
    month.forEach(i => {
      const dayIndex = dayjs(i.date).date() - 1;
      const value = i.units && i.pricePerUnit ? i.units * i.pricePerUnit : i.amount;
      arr[dayIndex] += value;
    });

    // cumulative
    return arr.map((_, i) => arr.slice(0, i + 1).reduce((s, v) => s + v, 0));
  }, [month]);

  const visibleLabels = labels.slice(0, visibleDays);
  const visibleValues = dailyData.slice(0, visibleDays);

  // ---------------- Chart Config ----------------
  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: () => theme.primary,
    labelColor: () =>
      theme.name === 'dark' ? 'rgba(255,255,255,0.8)' : theme.textDark,
    propsForBackgroundLines: {
      strokeDasharray: '4',
      stroke: theme.border,
    },
    propsForLabels: {
      fontSize: 11,
      fill: theme.textLight,
    },
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.textDark }]}>Investment Trend</Text>

      <View style={{ alignItems: 'center' }}>
        {isDaily ? (
          <LineChart
            data={{
              labels: visibleLabels,
              datasets: [{ data: visibleValues }],
            }}
            width={screenWidth - 60}
            height={260}
            yAxisLabel="₹"
            segments={5}
            fromZero
            formatYLabel={(v) => Number(v).toLocaleString()}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : (
          <BarChart
            data={{
              labels: monthlyTrend.labels,
              datasets: [{ data: monthlyTrend.values }],
            }}
            width={screenWidth - 60}
            height={260}
            yAxisLabel="₹"
            yAxisSuffix=''
            fromZero
            chartConfig={{
              ...chartConfig,
              barPercentage: 0.55,
            }}
            style={styles.chart}
          />
        )}
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => setIsDaily(true)}
          style={[styles.toggleButton, isDaily && { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.toggleText, isDaily && { color: '#fff' }]}>Daily</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsDaily(false)}
          style={[styles.toggleButton, !isDaily && { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.toggleText, !isDaily && { color: '#fff' }]}>6M</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    marginTop: 10,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  chart: { borderRadius: 16, marginTop: 8 },
  toggleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 12 },
  toggleButton: { paddingHorizontal: 18, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e0e0e0' },
  toggleText: { fontWeight: '600', color: '#333' },
});
