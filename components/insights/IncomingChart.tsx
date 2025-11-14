import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import dayjs from 'dayjs';
import { useTheme } from '@/contexts/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function IncomingChart({
  transactions,
  currentMonth,
}: {
  transactions: any[];
  currentMonth: dayjs.Dayjs;
}) {
  const [isDaily, setIsDaily] = useState(true);
  const { theme } = useTheme();

  // Filter current & previous month
  const monthTx = useMemo(
    () => transactions.filter(tx => dayjs(tx.date).isSame(currentMonth, 'month')),
    [transactions, currentMonth]
  );

  const prevMonthTx = useMemo(
    () =>
      transactions.filter(tx =>
        dayjs(tx.date).isSame(currentMonth.subtract(1, 'month'), 'month')
      ),
    [transactions, currentMonth]
  );

  const daysInMonth = currentMonth.daysInMonth();
  const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

  // Daily + cumulative income
  const dailyCredit = Array(daysInMonth).fill(0);

  monthTx.forEach(tx => {
    const day = dayjs(tx.date).date() - 1;
    if (tx.type === 'credit') dailyCredit[day] += tx.amount;
  });

  const cumulativeCredit = dailyCredit.reduce((acc, val, i) => {
    acc[i] = i === 0 ? val : acc[i - 1] + val;
    return acc;
  }, [] as number[]);

  const today = dayjs();
  const isCurrentMonth = today.isSame(currentMonth, 'month');
  const daysToShow = isCurrentMonth ? today.date() : daysInMonth;

  const visibleData = cumulativeCredit.slice(0, daysToShow);
  const visibleLabels = labels.slice(0, daysToShow);

  const incomeTotal = visibleData[visibleData.length - 1] || 0;

  const lastMonthIncome = prevMonthTx
    .filter(tx => tx.type === 'credit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Last 6 months graph
  const monthlyLabels: string[] = [];
  const monthlyIncome: number[] = [];

  for (let i = 5; i >= 0; i--) {
    const m = currentMonth.subtract(i, 'month');
    const total = transactions
      .filter(tx => dayjs(tx.date).isSame(m, 'month') && tx.type === 'credit')
      .reduce((sum, tx) => sum + tx.amount, 0);

    monthlyLabels.push(m.format('MMM'));
    monthlyIncome.push(total);
  }

  const formatYAxis = (value: any) => {
    const num = Number(value);
    if (isNaN(num)) return '0';
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  // Chart Config — theme friendly
  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.textDark + Math.floor(opacity * 255).toString(16),
    labelColor: () => theme.textLight,
    propsForBackgroundLines: { strokeDasharray: '4', strokeWidth: 0.6, stroke: theme.border },
  };

  return (
    <>
      {/* Summary Section */}
      <View style={styles.comparisonContainer}>
        <View style={styles.comparisonBox}>
          <Text style={[styles.smallText, { color: theme.textLight }]}>
            This month so far
          </Text>
          <Text style={[styles.valueText, { color: theme.success }]}>
            ₹{incomeTotal.toFixed(0)}
          </Text>
        </View>

        <View style={styles.comparisonBox}>
          <Text style={[styles.smallText, { color: theme.textLight }]}>Last month</Text>
          <Text style={[styles.valueText, { color: theme.textDark }]}>
            ₹{formatYAxis(lastMonthIncome)}
          </Text>
        </View>
      </View>

      {/* Chart Card */}
      <View style={[styles.graphCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textDark }]}>
          {isDaily ? 'Daily Incoming Overview' : 'Monthly Incoming Overview'}
        </Text>

        {/* DAILY CHART */}
        {isDaily ? (
          <LineChart
            data={{
              labels: visibleLabels,
              datasets: [
                { data: visibleData, color: () => theme.success, strokeWidth: 2 },
              ],
            }}
            width={screenWidth - 60}
            height={260}
            yAxisLabel="₹"
            formatYLabel={(v) => formatYAxis(Number(v))}
            chartConfig={chartConfig}
            withInnerLines
            bezier
            segments={5}
            style={{ borderRadius: 12 }}
          />
        ) : (
          // MONTHLY BAR CHART
          <BarChart
            data={{
              labels: monthlyLabels,
              datasets: [{ data: monthlyIncome }],
            }}
            width={screenWidth - 60}
            height={260}
            yAxisLabel="₹"
            yAxisSuffix=""
            fromZero
            withInnerLines
            chartConfig={{
              ...chartConfig,
              barPercentage: 0.55,
              color: () => theme.success,
            }}
            style={{ borderRadius: 12 }}
          />
        )}

        {/* Toggle Buttons */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setIsDaily(true)}
            style={[
              styles.toggleButton,
              { backgroundColor: isDaily ? theme.primary : theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={{ color: isDaily ? '#fff' : theme.textDark }}>Daily</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsDaily(false)}
            style={[
              styles.toggleButton,
              { backgroundColor: !isDaily ? theme.primary : theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={{ color: !isDaily ? '#fff' : theme.textDark }}>Monthly</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  comparisonBox: { alignItems: 'flex-start' },
  smallText: { fontSize: 13 },
  valueText: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  graphCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 18,
  },
  toggleButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
});
