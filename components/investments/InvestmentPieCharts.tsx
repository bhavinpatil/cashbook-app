// components/investments/InvestmentPieCharts.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '@/contexts/ThemeContext';
import { Investment } from '@/hooks/useInvestmentsStore';

const screenWidth = Dimensions.get('window').width;

export default function InvestmentPieCharts({ all, month }: { all: Investment[]; month: Investment[] }) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'month' | 'overall'>('month');

  const COLORS = [
    '#4e79a7', '#f28e2b', '#e15759',
    '#76b7b2', '#59a14f', '#edc948',
    '#b07aa1', '#9c755f', '#bab0ab'
  ];

  const compute = (list: Investment[]) => {
    const map: Record<string, number> = {};
    list.forEach((i) => {
      const val = i.units && i.pricePerUnit ? i.units * i.pricePerUnit : i.amount || 0;
      map[i.type] = (map[i.type] || 0) + val;
    });

    return Object.entries(map).map(([name, value], idx) => ({
      name,
      value,
      color: COLORS[idx % COLORS.length],
      legendFontColor: theme.textDark,
      legendFontSize: 13,
    }));
  };

  const dataMonth = useMemo(() => compute(month), [month]);
  const dataAll = useMemo(() => compute(all), [all]);

  const selected = activeTab === 'month' ? dataMonth : dataAll;
  const title = activeTab === 'month' ? 'This Month' : 'Overall Investments';

  return (
    <View>
      {/* Toggle Tabs */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('month')}
          style={[
            styles.toggleBtn,
            activeTab === 'month' && { backgroundColor: theme.primary }
          ]}
        >
          <Text style={{ color: activeTab === 'month' ? '#fff' : theme.textDark }}>This Month</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('overall')}
          style={[
            styles.toggleBtn,
            activeTab === 'overall' && { backgroundColor: theme.primary }
          ]}
        >
          <Text style={{ color: activeTab === 'overall' ? '#fff' : theme.textDark }}>Overall</Text>
        </TouchableOpacity>
      </View>

      {/* Pie Chart */}
      {/* Pie Chart */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textDark }]}>{title}</Text>

        {selected.length > 0 ? (
          <>
            <View style={{ alignItems: "center", width: "100%", paddingLeft: 'auto' }}>
              <PieChart
                data={selected}
                width={screenWidth - 80}
                height={220}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="0"
                hasLegend={true}
                chartConfig={{ color: () => theme.primary }}
                style={{ marginVertical: 4 }}
              />
              <View style={styles.legend}>
                {selected.map((d, i) => (
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
          <Text style={{ color: theme.textLight }}>No Data</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 1,
  },
  card: {
    padding: 14,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  legend: { marginTop: 10, paddingHorizontal: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: 13 },
});
