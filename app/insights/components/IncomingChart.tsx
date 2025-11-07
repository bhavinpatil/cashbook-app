// app/insights/components/IncomingChart.tsx

import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import dayjs from 'dayjs';

const screenWidth = Dimensions.get('window').width;

export default function IncomingChart({
  transactions,
  currentMonth,
}: {
  transactions: any[];
  currentMonth: dayjs.Dayjs;
}) {
  const [isDaily, setIsDaily] = useState(true);

  // 🔢 Filter current and previous month transactions
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

  // 🧮 Daily + cumulative income
  const dailyCredit = Array(daysInMonth).fill(0);
  monthTx.forEach(tx => {
    const day = dayjs(tx.date).date() - 1;
    if (tx.type === 'credit') dailyCredit[day] += tx.amount;
  });

  const cumulativeCredit = dailyCredit.reduce((acc, val, i) => {
    if (i === 0) acc[i] = val;
    else acc[i] = acc[i - 1] + val;
    return acc;
  }, [] as number[]);

  // 📆 Handle current date visibility
  const today = dayjs();
  const isCurrentMonth = today.isSame(currentMonth, 'month');
  const daysToShow = isCurrentMonth ? today.date() : daysInMonth;

  // ✅ Show data only till today (no future plotting)
  const visibleData = cumulativeCredit.slice(0, daysToShow);
  const visibleLabels = labels.slice(0, daysToShow);

  const incomeTotal = visibleData[visibleData.length - 1] || 0;
  const lastMonthIncome = prevMonthTx
    .filter(tx => tx.type === 'credit')
    .reduce((a, b) => a + b, 0);

  // 📈 Monthly income for last 6 months
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
    if (isNaN(num) || num === undefined || num === null) return '0';
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(30, 30, 30, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
    propsForBackgroundLines: { strokeDasharray: '4', strokeWidth: 0.5 },
    fillShadowGradientFrom: '#2a9d8f',
    fillShadowGradientFromOpacity: 0.15,
    fillShadowGradientTo: '#d9f3ec',
    fillShadowGradientToOpacity: 0.05,
  };

  return (
    <>
      {/* Summary Section */}
      <View style={styles.comparisonContainer}>
        <View style={styles.comparisonBox}>
          <Text style={styles.smallText}>This month so far</Text>
          <Text style={[styles.valueText, { color: '#2a9d8f' }]}>
            ₹{incomeTotal.toFixed(0)}
          </Text>
        </View>
        <View style={styles.comparisonBox}>
          <Text style={styles.smallText}>Last month</Text>
          <Text style={[styles.valueText, { color: '#000' }]}>
            ₹{formatYAxis(lastMonthIncome)}
          </Text>
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.graphCard}>
        <Text style={styles.sectionTitle}>
          {isDaily ? 'Daily Incoming Overview' : 'Monthly Incoming Overview'}
        </Text>

        {isDaily ? (
          // 📈 Cumulative Line Chart (only till today)
          <LineChart
            data={{
              labels: visibleLabels,
              datasets: [
                {
                  data: visibleData,
                  color: () => '#2a9d8f',
                  strokeWidth: 2,
                },
              ],
            }}
            width={screenWidth - 60}
            height={260}
            yAxisLabel="₹"
            formatYLabel={(v) => formatYAxis(Number(v))}
            formatXLabel={(xValue) => {
              const day = Number(xValue);
              const visibleDays = [1, Math.ceil(daysToShow / 2), daysToShow];
              return visibleDays.includes(day)
                ? `${day} ${currentMonth.format('MMM')}`
                : '';
            }}
            chartConfig={chartConfig}
            fromZero
            withOuterLines={false}
            withInnerLines
            withHorizontalLabels
            bezier
            segments={5}
            style={{ borderRadius: 12 }}
          />
        ) : (
          // 📊 Monthly Bar Chart
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
            showValuesOnTopOfBars
            withInnerLines
            chartConfig={{
              ...chartConfig,
              barPercentage: 0.6,
              color: (opacity = 1) => `rgba(42, 157, 143, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
            }}
            style={{ borderRadius: 12 }}
          />
        )}

        {/* Toggle Buttons */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setIsDaily(true)}
            style={[styles.toggleButton, isDaily && styles.activeToggle]}
          >
            <Text style={isDaily ? styles.toggleTextActive : styles.toggleText}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsDaily(false)}
            style={[styles.toggleButton, !isDaily && styles.activeToggle]}
          >
            <Text style={!isDaily ? styles.toggleTextActive : styles.toggleText}>Monthly</Text>
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
  smallText: { fontSize: 13, color: '#666' },
  valueText: { fontSize: 16, fontWeight: '700' },
  graphCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  toggleButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  activeToggle: {
    backgroundColor: '#111',
  },
  toggleText: { color: '#333', fontWeight: '600' },
  toggleTextActive: { color: '#fff', fontWeight: '600' },
});
