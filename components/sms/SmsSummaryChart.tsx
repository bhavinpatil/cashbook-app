// components/sms/SmsSummaryChart.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { SmsTransaction } from '@/types/sms';

export default function SmsSummaryChart({ transactions }: { transactions: SmsTransaction[] }) {
  const categoryMap: Record<string, number> = {};
  transactions.forEach(t => {
    const key = t.category || 'Uncategorized';
    categoryMap[key] = (categoryMap[key] || 0) + t.amount;
  });

  const data = Object.entries(categoryMap).map(([name, value], i) => ({
    name,
    amount: value,
    color: `hsl(${i * 60}, 70%, 55%)`,
    legendFontColor: '#555',
    legendFontSize: 13,
  }));

  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <Text style={{ fontWeight: '700', marginBottom: 10 }}>Category Summary</Text>
      {data.length > 0 ? (
        <PieChart
          data={data.map(d => ({
            name: d.name,
            population: d.amount,
            color: d.color,
            legendFontColor: d.legendFontColor,
            legendFontSize: d.legendFontSize,
          }))}
          width={340}
          height={220}
          chartConfig={{
            backgroundColor: 'transparent',
            color: () => '#000',
            decimalPlaces: 0,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Text style={{ color: '#888' }}>No categorized data</Text>
      )}
    </View>
  );
}
