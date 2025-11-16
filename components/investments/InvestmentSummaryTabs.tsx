// components/investments/InvestmentSummaryTabs.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { InvestmentType } from '@/hooks/useInvestmentsStore';

type Props = {
  totals: Record<string, number>;
  onSelectType: (t: 'All' | InvestmentType) => void;
  active: 'All' | InvestmentType;
};

const ORDER: (InvestmentType | 'All')[] = [
  'All', 'Stocks', 'Mutual Funds', 'Gold', 'ETF',
  'Bonds', 'FD', 'Crypto', 'Real Estate', 'Other'
];

export default function InvestmentSummaryTabs({ totals, onSelectType, active }: Props) {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(true);

  const totalOverall = Object.values(totals).reduce((s, v) => s + v, 0);

  const renderTab = (key: InvestmentType | 'All') => {
    const isAll = key === 'All';
    const value = isAll ? totalOverall : totals[key] || 0;
    const activeTab = active === key;

    return (
      <TouchableOpacity
        key={String(key)}
        onPress={() => {
          onSelectType(isAll ? 'All' : (key as InvestmentType));
          setCollapsed(true);
        }}
        style={[
          styles.tab,
          {
            backgroundColor: activeTab ? theme.primary : theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: activeTab ? '#fff' : theme.textDark }]}>
          {key}
        </Text>
        <Text style={[styles.amount, { color: activeTab ? '#fff' : theme.textLight }]}>
          ₹{value.toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ marginBottom: 14 }}>
      {/* Header Row */}
      <TouchableOpacity
        onPress={() => setCollapsed(!collapsed)}
        style={styles.headerRow}
      >
        <Text style={[styles.headerLabel, { color: theme.textDark }]}>
          Filter: {active}
        </Text>
        <Ionicons
          name={collapsed ? 'chevron-down' : 'chevron-up'}
          size={18}
          color={theme.textDark}
        />
      </TouchableOpacity>

      {/* Tabs */}
      {!collapsed && (
        <View style={styles.row}>
          {ORDER.map(renderTab)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  headerLabel: { fontSize: 15, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  tab: {
    width: '32%',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  title: { fontSize: 12, fontWeight: '700' },
  amount: { fontSize: 12, marginTop: 4 },
});
