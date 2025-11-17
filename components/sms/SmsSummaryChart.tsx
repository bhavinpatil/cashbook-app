// components/sms/SmsSummaryChart.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '@/contexts/ThemeContext';
import type { SmsTransaction } from '@/types/sms';

const screenWidth = Dimensions.get('window').width;
const round2 = (n: number) => Number(Number(n).toFixed(2));

// 25-color palette
const PALETTE = [
  '#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0',
  '#E91E63', '#795548', '#009688', '#3F51B5', '#8BC34A',
  '#CDDC39', '#FF9800', '#607D8B', '#673AB7', '#F44336',
  '#00BCD4', '#C2185B', '#7B1FA2', '#D4E157', '#FF7043',
  '#5C6BC0', '#26A69A', '#90A4AE', '#A1887F', '#9575CD',
];

export default function SmsSummaryChart({ transactions }: { transactions: SmsTransaction[] }) {
  const { theme } = useTheme();
  const [othersExpanded, setOthersExpanded] = useState(false);

  // ---------- CATEGORY TOTALS (DEBIT ONLY) ----------
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type !== 'Debit') return;     // ❗ Include only Debit transactions

      const key = t.category || 'Uncategorized';
      map[key] = round2((map[key] || 0) + round2(t.amount));
    });

    return map;
  }, [transactions]);

  // Sorted categories
  const sortedCats = useMemo(() => {
    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [categoryTotals]);

  // Top 8 + Others
  const TOP_N = 8;
  const top = sortedCats.slice(0, TOP_N);
  const others = sortedCats.slice(TOP_N);
  const othersSum = round2(others.reduce((s, c) => s + c.amount, 0));

  // Pie Chart Data
  const pieData = useMemo(() => {
    const items = top.map((c, idx) => ({
      name: c.name,
      population: c.amount,
      color: PALETTE[idx % PALETTE.length],
      legendFontColor: theme.textDark,
      legendFontSize: 12,
    }));

    if (others.length > 0) {
      items.push({
        name: 'Others',
        population: othersSum,
        color: '#A1A1A1',
        legendFontColor: theme.textDark,
        legendFontSize: 12,
      });
    }

    return items.filter((i) => i.population > 0);
  }, [top, others, othersSum, theme.textDark]);

  const chips = top.map((c, idx) => ({
    name: c.name,
    amount: c.amount,
    color: PALETTE[idx % PALETTE.length],
  }));

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <View style={[styles.container]}>
      <Text style={[styles.title, { color: theme.textDark }]}>Category Summary</Text>

      {pieData.length === 0 ? (
        <Text style={{ color: theme.textLight, textAlign: 'center' }}>No debit category data</Text>
      ) : (
        <>
          {/* PIE CHART */}
          <View style={styles.chartRow}>
            <PieChart
              data={pieData}
              width={Math.min(screenWidth - 48, 420)}
              height={220}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              chartConfig={{ color: () => theme.primary }}
              absolute
            />
          </View>

          {/* TOP CATEGORY CHIPS */}
          <View style={styles.chipsWrap}>
            {chips.map((c) => (
              <View
                key={`chip-${c.name}`}
                style={[
                  styles.chip,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: c.color }]} />
                <Text style={[styles.chipText, { color: theme.textDark }]}>
                  {c.name} — ₹{fmt(c.amount)}
                </Text>
              </View>
            ))}
          </View>

          {/* OTHERS DROPDOWN */}
          {others.length > 0 && (
            <View style={{ marginTop: 10, width: '100%' }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setOthersExpanded((v) => !v)}
                style={[
                  styles.othersHeader,
                  { borderColor: theme.border, backgroundColor: theme.card },
                ]}
              >
                <Text style={{ color: theme.textDark, fontWeight: '600' }}>
                  Others ({others.length}) — ₹{fmt(othersSum)}
                </Text>
                <Text style={{ color: theme.textLight }}>
                  {othersExpanded ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {othersExpanded && (
                <View
                  style={[
                    styles.othersListWrapper,
                    { borderColor: theme.border, backgroundColor: theme.card },
                  ]}
                >
                  <ScrollView style={{ maxHeight: 180 }} contentContainerStyle={{ padding: 8 }}>
                    {others.map((c, idx) => {
                      const color = PALETTE[(TOP_N + idx) % PALETTE.length];
                      return (
                        <View key={`other-${c.name}`} style={styles.otherRow}>
                          <View style={[styles.dot, { backgroundColor: color }]} />
                          <Text style={[styles.otherText, { color: theme.textDark }]}>
                            {c.name}
                          </Text>
                          <Text style={[styles.otherAmount, { color: theme.textDark }]}>
                            ₹{fmt(c.amount)}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 12, width: '100%' },
  title: { fontWeight: '700', marginBottom: 8, fontSize: 16 },
  chartRow: { alignItems: 'center' },
  chipsWrap: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    justifyContent: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  othersHeader: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  othersListWrapper: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 8,
  },
  otherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    justifyContent: 'space-between',
  },
  otherText: { flex: 1, fontSize: 14, marginLeft: 8 },
  otherAmount: { fontSize: 13, fontWeight: '700' },
});
