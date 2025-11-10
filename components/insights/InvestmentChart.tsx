// components/insights/InvestmentChart.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useInvestments } from '@/hooks/useInvestments';
import { Transaction } from '@/types/types';
import { useTheme } from '@/contexts/ThemeContext';
import dayjs from 'dayjs';

const screenWidth = Dimensions.get('window').width;

type Props = {
  transactions: Transaction[];
};

export default function InvestmentChart({ transactions }: Props) {
  const { theme } = useTheme();
  const [isDaily, setIsDaily] = useState(true);
  const { getMonthlyTrend, getTypeData, getTotalInvested } = useInvestments(transactions);

  const total = getTotalInvested();

  // 🧮 Prepare daily investment data for current month
  const currentMonth = dayjs();
  const daysInMonth = currentMonth.daysInMonth();
  const dailyTotals = Array(daysInMonth).fill(0);

  transactions
    .filter(tx => dayjs(tx.date).isSame(currentMonth, 'month'))
    .forEach(tx => {
      const day = dayjs(tx.date).date() - 1;
      dailyTotals[day] += tx.amount;
    });

  // 📈 Cumulative daily totals
  const cumulativeDaily = dailyTotals.reduce((acc, val, i) => {
    acc[i] = (i === 0 ? val : acc[i - 1] + val);
    return acc;
  }, [] as number[]);

  const today = dayjs();
  const isCurrentMonth = today.isSame(currentMonth, 'month');
  const daysToShow = isCurrentMonth ? today.date() : daysInMonth;

  const visibleData = cumulativeDaily.slice(0, daysToShow);
  const visibleLabels = Array.from({ length: daysToShow }, (_, i) => String(i + 1));

  // 📊 Monthly trend from hook
  const monthly = getMonthlyTrend();

  // 🧩 Diversification data
  const typeData = getTypeData();
  const totalValue = typeData.reduce((sum, t) => sum + t.value, 0);
  const colors = [
    '#4e79a7',
    '#f28e2b',
    '#e15759',
    '#76b7b2',
    '#59a14f',
    '#edc948',
    '#b07aa1',
  ];

  // 💡 Format Y-axis labels
  const formatYAxis = (value: any) => {
    const num = Number(value);
    if (isNaN(num)) return '0';
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => theme.primary,
    labelColor: (opacity = 1) => `rgba(60,60,60,${opacity})`,
    propsForBackgroundLines: { strokeDasharray: '4', strokeWidth: 0.5 },
  };

  // 💰 Summary calculations
  const lastMonth = currentMonth.subtract(1, 'month');
  const thisMonthTotal = transactions
    .filter(tx => dayjs(tx.date).isSame(currentMonth, 'month'))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const lastMonthTotal = transactions
    .filter(tx => dayjs(tx.date).isSame(lastMonth, 'month'))
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <View>
      {/* Summary Section */}
      <View style={styles.comparisonContainer}>
        <View style={styles.comparisonBox}>
          <Text style={styles.smallText}>This month</Text>
          <Text style={[styles.valueText, { color: theme.primary }]}>
            ₹{thisMonthTotal.toFixed(0)}
          </Text>
        </View>
        <View style={styles.comparisonBox}>
          <Text style={styles.smallText}>Last month</Text>
          <Text style={[styles.valueText, { color: theme.textDark }]}>
            ₹{lastMonthTotal.toFixed(0)}
          </Text>
        </View>
      </View>

      {/* Chart Section */}
      <View
        style={[
          styles.graphCard,
          { backgroundColor: theme.card, shadowColor: theme.textDark },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textDark }]}>
          {isDaily ? 'Daily Investment Growth' : 'Monthly Investment Overview'}
        </Text>

        {isDaily ? (
          <LineChart
            data={{
              labels: visibleLabels,
              datasets: [
                {
                  data: visibleData,
                  color: () => theme.primary,
                  strokeWidth: 2,
                },
              ],
            }}
            width={screenWidth - 60}
            height={260}
            yAxisLabel="₹"
            formatYLabel={v => formatYAxis(v)}
            chartConfig={chartConfig}
            fromZero
            withInnerLines
            withHorizontalLabels
            bezier
            segments={5}
            style={{ borderRadius: 12 }}
          />
        ) : (
          <BarChart
            data={{
              labels: monthly.labels,
              datasets: [{ data: monthly.values }],
            }}
            width={screenWidth - 60}
            height={260}
            yAxisLabel="₹"
            yAxisSuffix=""
            fromZero
            chartConfig={{
              ...chartConfig,
              barPercentage: 0.6,
              color: (opacity = 1) => theme.primary,
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
            <Text
              style={isDaily ? styles.toggleTextActive : styles.toggleText}
            >
              Daily
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsDaily(false)}
            style={[styles.toggleButton, !isDaily && styles.activeToggle]}
          >
            <Text
              style={!isDaily ? styles.toggleTextActive : styles.toggleText}
            >
              Monthly
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pie Chart Section */}
      {typeData.length > 0 && (
        <View style={styles.pieCard}>
          <Text style={[styles.sectionTitle, { color: theme.textDark }]}>
            🧩 Diversification by Type
          </Text>
          <View style={{ alignItems: 'center' }}>
            <PieChart
              data={typeData.map((t, i) => ({
                name: t.name,
                value: t.value,
                color: colors[i % colors.length],
                legendFontColor: theme.textDark,
                legendFontSize: 13,
              }))}
              width={screenWidth - 60}
              height={200}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="16"
              hasLegend={false}
              absolute
              center={[0, 0]}
              chartConfig={chartConfig}
              style={{ marginBottom: 16 }}
            />
            <Text style={[styles.totalText, { color: theme.textDark }]}>
              Total ₹{totalValue.toLocaleString()}
            </Text>
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            {typeData.map((t, i) => (
              <View key={i} style={styles.legendItem}>
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: colors[i % colors.length] },
                  ]}
                />
                <Text style={[styles.legendText, { color: theme.textDark }]}>
                  {t.name} — ₹{t.value.toLocaleString()} (
                  {((t.value / totalValue) * 100).toFixed(1)}%)
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
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
    borderRadius: 16,
    padding: 16,
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
  pieCard: {
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  totalText: { fontSize: 15, fontWeight: '600', marginTop: -20 },
  legendContainer: {
    marginTop: 12,
    gap: 6,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
  },
});
