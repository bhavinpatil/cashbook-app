// components/insights/IncomingChart.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import dayjs from 'dayjs';
import { useTheme } from '@/contexts/ThemeContext';

const screenWidth = Dimensions.get('window').width;

// --- Helpers ---
const round2 = (n: number) => Number(Number(n).toFixed(2));
const fmt = (n: number) => {
  try {
    return n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return round2(n).toFixed(2);
  }
};

export default function IncomingChart({
  transactions,
  currentMonth,
}: {
  transactions: any[];
  currentMonth: dayjs.Dayjs;
}) {
  const [isDaily, setIsDaily] = useState(true);
  const { theme } = useTheme();

  // Filter data for current month
  const monthTx = useMemo(
    () =>
      transactions.filter(tx =>
        dayjs(tx.date).isSame(currentMonth, 'month')
      ),
    [transactions, currentMonth]
  );

  // Previous month data
  const prevMonthTx = useMemo(
    () =>
      transactions.filter(tx =>
        dayjs(tx.date).isSame(currentMonth.subtract(1, 'month'), 'month')
      ),
    [transactions, currentMonth]
  );

  const daysInMonth = currentMonth.daysInMonth();
  const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

  // --- Daily credit totals ---
  const dailyCredit = Array(daysInMonth).fill(0);

  monthTx.forEach(tx => {
    if (tx.type === 'credit') {
      const index = dayjs(tx.date).date() - 1;
      dailyCredit[index] = round2(dailyCredit[index] + round2(tx.amount));
    }
  });

  // --- Cumulative credit ---
  const cumulativeCredit: number[] = [];
  dailyCredit.forEach((v, i) => {
    cumulativeCredit[i] = round2(v + (i > 0 ? cumulativeCredit[i - 1] : 0));
  });

  // Show only till today
  const today = dayjs();
  const isCurrent = today.isSame(currentMonth, 'month');
  const daysToShow = isCurrent ? today.date() : daysInMonth;

  const visibleData = cumulativeCredit.slice(0, daysToShow);
  const visibleLabels = labels.slice(0, daysToShow);

  const incomeTotal = visibleData.length > 0 ? visibleData[visibleData.length - 1] : 0;

  // --- Previous month income ---
  const lastMonthIncome = round2(
    prevMonthTx
      .filter(tx => tx.type === 'credit')
      .reduce((sum, tx) => sum + round2(tx.amount), 0)
  );

  // --- Last 6 months graph ---
  const monthlyLabels: string[] = [];
  const monthlyIncome: number[] = [];

  for (let i = 5; i >= 0; i--) {
    const m = currentMonth.subtract(i, 'month');

    const total = round2(
      transactions
        .filter(tx => dayjs(tx.date).isSame(m, 'month') && tx.type === 'credit')
        .reduce((sum, tx) => sum + round2(tx.amount), 0)
    );

    monthlyLabels.push(m.format('MMM'));
    monthlyIncome.push(total);
  }

  // Nice Y-axis formatting
  const formatYAxis = (value: any) => {
    const num = Number(value);
    if (isNaN(num)) return '0';

    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: () => theme.textDark,
    labelColor: () => theme.textLight,
    propsForBackgroundLines: {
      strokeDasharray: '4',
      strokeWidth: 0.6,
      stroke: theme.border,
    },
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
            ₹{fmt(incomeTotal)}
          </Text>
        </View>

        <View style={styles.comparisonBox}>
          <Text style={[styles.smallText, { color: theme.textLight }]}>Last month</Text>
          <Text style={[styles.valueText, { color: theme.textDark }]}>
            ₹{fmt(lastMonthIncome)}
          </Text>
        </View>
      </View>

      {/* Card */}
      <View style={[styles.graphCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textDark }]}>
          {isDaily ? 'Daily Incoming Overview' : 'Monthly Incoming Overview'}
        </Text>

        {/* Daily Line Chart */}
        {isDaily ? (
          <LineChart
            data={{
              labels: visibleLabels,
              datasets: [{ data: visibleData, color: () => theme.success, strokeWidth: 2 }],
            }}
            width={screenWidth - 60}
            height={260}
            yAxisLabel="₹"
            formatYLabel={v => formatYAxis(Number(v))}
            chartConfig={chartConfig}
            withInnerLines
            bezier
            segments={5}
            style={{ borderRadius: 12 }}
          />
        ) : (
          /* Monthly Bar Chart */
          <BarChart
            data={{
              labels: monthlyLabels,
              datasets: [{ data: monthlyIncome }],
            }}
            width={screenWidth - 60}
            height={260}
            yAxisLabel="₹"
            fromZero
            yAxisSuffix=''
            withInnerLines
            chartConfig={{
              ...chartConfig,
              barPercentage: 0.55,
              color: () => theme.success,
            }}
            style={{ borderRadius: 12 }}
          />
        )}

        {/* Toggle */}
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
