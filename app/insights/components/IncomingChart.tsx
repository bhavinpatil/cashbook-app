// app/insights/components/IncomingChart.tsx

import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
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

  // 🔢 Filter transactions for current and previous months
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

  // 🧮 Calculate daily credits
  const dailyCredit = Array(daysInMonth).fill(0);
  monthTx.forEach(tx => {
    const day = dayjs(tx.date).date() - 1;
    if (tx.type === 'credit') dailyCredit[day] += tx.amount;
  });

  const incomeTotal = dailyCredit.reduce((a, b) => a + b, 0);
  const lastMonthIncome = prevMonthTx
    .filter(tx => tx.type === 'credit')
    .reduce((a, b) => a + b, 0);

  // 📆 Prepare monthly income data (last 6 months)
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

  // 💰 Format Y-axis labels
  const formatYAxis = (value: any) => {
    const num = Number(value);
    if (isNaN(num) || num === undefined || num === null) return '0';
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  // 📊 X-axis labels
  const getVisibleLabels = (days: number) => [
    '1 ' + currentMonth.format('MMM'),
    `${Math.ceil(days / 2)} ${currentMonth.format('MMM')}`,
    `${days} ${currentMonth.format('MMM')}`,
  ];

  const labels = getVisibleLabels(daysInMonth);

  // 🎨 Chart configuration
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(30, 30, 30, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
    propsForBackgroundLines: { strokeDasharray: '4', strokeWidth: 0.5 },
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={{
              labels: isDaily ? labels : monthlyLabels,
              datasets: [
                {
                  data: isDaily ? dailyCredit : monthlyIncome,
                  color: () => '#2a9d8f', // Green tone for income
                  strokeWidth: 2,
                  withDots: false,
                },
              ],
              legend: [isDaily ? 'Daily Income' : 'Monthly Income'],
            }}
            width={Math.max(screenWidth - 40, labels.length * 25)}
            height={260}
            yAxisLabel="₹"
            formatYLabel={v => formatYAxis(Number(v))}
            chartConfig={chartConfig}
            fromZero
            withOuterLines={false}
            withInnerLines={true}
            withHorizontalLabels={true}
            bezier
            segments={5}
            style={{ borderRadius: 12, marginLeft: -5 }}
          />
        </ScrollView>

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
