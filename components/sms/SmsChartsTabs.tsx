// components/sms/SmsChartsTabs.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import SmsSummaryChart from '@/components/sms/SmsSummaryChart';
import SmsCreditDebitChart from '@/components/sms/SmsCreditDebitChart';
import type { SmsTransaction } from '@/types/sms';

const screenWidth = Dimensions.get('window').width;

export default function SmsChartsTabs({ transactions }: { transactions: SmsTransaction[] }) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'category' | 'creditdebit'>('category');

  const dataForTab = useMemo(() => {
    return transactions;
  }, [transactions]);

  return (
    <View>
      {/* Tabs */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('category')}
          style={[
            styles.toggleBtn,
            {
              backgroundColor: activeTab === 'category' ? theme.primary : 'transparent',
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons
            name="pie-chart"
            size={16}
            color={activeTab === 'category' ? '#fff' : theme.textDark}
          />
          <Text style={{ marginLeft: 8, color: activeTab === 'category' ? '#fff' : theme.textDark, fontWeight: '600' }}>
            Category
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('creditdebit')}
          style={[
            styles.toggleBtn,
            {
              backgroundColor: activeTab === 'creditdebit' ? theme.primary : 'transparent',
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons
            name="swap-vertical"
            size={16}
            color={activeTab === 'creditdebit' ? '#fff' : theme.textDark}
          />
          <Text style={{ marginLeft: 8, color: activeTab === 'creditdebit' ? '#fff' : theme.textDark, fontWeight: '600' }}>
            Credit / Debit
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={{ paddingHorizontal: 2 }}>
        {activeTab === 'category' ? (
          <View style={{ alignItems: 'center' }}>
            {/* keep existing summary chart */}
            <SmsSummaryChart transactions={dataForTab} />
          </View>
        ) : (
          <SmsCreditDebitChart transactions={dataForTab} />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 6,
  },
});
