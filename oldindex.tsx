import React, { useMemo, useState, useEffect } from 'react';
import {
  ScrollView,
  Dimensions,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTransactions } from '../transactions/hooks/useTransactions';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const route = useRoute();
  const { bookId, bookName } = (route.params as { bookId?: string; bookName?: string }) || {};

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [activeTab, setActiveTab] = useState<'spends' | 'invested' | 'incoming'>('spends');
  const [budget, setBudget] = useState<number>(40000);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [tempBudget, setTempBudget] = useState<string>(String(budget));
  const [isDaily, setIsDaily] = useState(true);

  const { transactions, loading } = useTransactions(bookId || '');

  const goToPrevMonth = () => setCurrentMonth(prev => prev.subtract(1, 'month'));
  const goToNextMonth = () => setCurrentMonth(prev => prev.add(1, 'month'));

  // 🧠 Load saved budget for this book + month
  useEffect(() => {
    const loadBudget = async () => {
      if (!bookId) return;
      const key = `budget_${bookId}_${currentMonth.format('YYYY_MM')}`;
      const saved = await AsyncStorage.getItem(key);
      if (saved) setBudget(Number(saved));
    };
    loadBudget();
  }, [bookId, currentMonth]);

  // 💾 Save budget whenever updated
  const saveBudget = async (value: number) => {
    if (!bookId) return;
    const key = `budget_${bookId}_${currentMonth.format('YYYY_MM')}`;
    await AsyncStorage.setItem(key, String(value));
  };

  if (!bookId) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#222', fontSize: 16 }}>No book selected</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#222' }}>Loading...</Text>
      </View>
    );
  }

  // 🔢 Filter transactions
  const monthTransactions = useMemo(
    () => transactions.filter(tx => dayjs(tx.date).isSame(currentMonth, 'month')),
    [transactions, currentMonth]
  );

  const prevMonthTransactions = useMemo(
    () =>
      transactions.filter(tx =>
        dayjs(tx.date).isSame(currentMonth.subtract(1, 'month'), 'month')
      ),
    [transactions, currentMonth]
  );

  // 📅 Prepare daily totals
  const daysInMonth = currentMonth.daysInMonth();
  const dailyCredit = Array(daysInMonth).fill(0);
  const dailyDebit = Array(daysInMonth).fill(0);

  monthTransactions.forEach(tx => {
    const day = dayjs(tx.date).date() - 1;
    if (tx.type === 'credit') dailyCredit[day] += tx.amount;
    else dailyDebit[day] += tx.amount;
  });

  const spendsTotal = dailyDebit.reduce((a, b) => a + b, 0);
  const incomeTotal = dailyCredit.reduce((a, b) => a + b, 0);

  const lastMonthSpends = prevMonthTransactions
    .filter(tx => tx.type === 'debit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const formatYAxis = (value: number) => {
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  // X-axis labels (Daily view)
  const getVisibleLabels = (days: number) => [
    '1 ' + currentMonth.format('MMM'),
    `${Math.ceil(days / 2)} ${currentMonth.format('MMM')}`,
    `${days} ${currentMonth.format('MMM')}`,
  ];

  const labels = getVisibleLabels(daysInMonth);

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(30, 30, 30, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
    propsForBackgroundLines: { strokeDasharray: '4', strokeWidth: 0.5 },
  };

  // 📊 Monthly Data (Last 6 months total spend)
  const monthlyLabels: string[] = [];
  const monthlySpends: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const month = currentMonth.subtract(i, 'month');
    const monthSpend = transactions
      .filter(tx => dayjs(tx.date).isSame(month, 'month') && tx.type === 'debit')
      .reduce((sum, tx) => sum + tx.amount, 0);
    monthlyLabels.push(month.format('MMM'));
    monthlySpends.push(monthSpend);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Header: Month Navigation */}
      <View style={styles.monthHeader}>
        <TouchableOpacity style={styles.navArrow} onPress={goToPrevMonth}>
          <Ionicons name="chevron-back" size={28} color="#111" />
        </TouchableOpacity>

        <Text style={styles.monthText}>{currentMonth.format('MMMM YYYY')}</Text>

        <TouchableOpacity style={styles.navArrow} onPress={goToNextMonth}>
          <Ionicons name="chevron-forward" size={28} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.summaryTabs}>
        {['spends', 'invested', 'incoming'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            style={[styles.tabItem, activeTab === tab && styles.activeTab]}
          >
            <Text style={styles.tabLabel}>
              {tab === 'spends' ? 'Spends' : tab === 'invested' ? 'Invested' : 'Incoming'}
            </Text>
            <Text
              style={[
                styles.tabValue,
                tab === 'spends'
                  ? { color: '#e63946' }
                  : tab === 'incoming'
                  ? { color: '#2a9d8f' }
                  : {},
              ]}
            >
              ₹
              {tab === 'spends'
                ? spendsTotal.toFixed(0)
                : tab === 'incoming'
                ? incomeTotal.toFixed(0)
                : '0'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Spends Section */}
      {activeTab === 'spends' && (
        <>
          <View style={styles.comparisonContainer}>
            <TouchableOpacity
              style={styles.comparisonBox}
              onPress={() => setShowBudgetModal(true)}
            >
              <Text style={styles.smallText}>This month so far</Text>
              <Text style={[styles.valueText, { color: '#2a9d8f' }]}>
                ₹{spendsTotal.toFixed(0)} / ₹{budget.toLocaleString()}
              </Text>
            </TouchableOpacity>
            <View style={styles.comparisonBox}>
              <Text style={styles.smallText}>Last month</Text>
              <Text style={[styles.valueText, { color: '#000' }]}>
                ₹{formatYAxis(lastMonthSpends)}
              </Text>
            </View>
          </View>

          <View style={styles.graphCard}>
            <Text style={styles.sectionTitle}>
              {isDaily ? 'Daily Spends Overview' : 'Monthly Spends Overview'}
            </Text>

            <LineChart
              data={{
                labels: isDaily ? labels : monthlyLabels,
                datasets: [
                  {
                    data: isDaily ? dailyDebit : monthlySpends,
                    color: () => '#e63946',
                    strokeWidth: 2,
                    withDots: false, // ✅ smooth line only
                  },
                  isDaily
                    ? {
                        data: Array(daysInMonth).fill(budget),
                        color: () => '#888',
                        strokeWidth: 1,
                        withDots: false,
                      }
                    : undefined,
                ].filter(Boolean) as any,
                legend: isDaily ? ['Spends', 'Budget'] : ['Total Spends'],
              }}
              width={screenWidth - 50}
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

            {/* Toggle Buttons */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                onPress={() => setIsDaily(true)}
                style={[styles.toggleButton, isDaily && styles.activeToggle]}
              >
                <Text style={isDaily ? styles.toggleTextActive : styles.toggleText}>
                  Daily
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsDaily(false)}
                style={[styles.toggleButton, !isDaily && styles.activeToggle]}
              >
                <Text style={!isDaily ? styles.toggleTextActive : styles.toggleText}>
                  Monthly
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* 🔢 Budget Modal */}
      <Modal visible={showBudgetModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Monthly Budget</Text>
            <TextInput
              style={styles.input}
              value={tempBudget}
              keyboardType="numeric"
              onChangeText={setTempBudget}
              placeholder="Enter new budget"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setShowBudgetModal(false);
                  setTempBudget(String(budget));
                }}
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const newBudget = Number(tempBudget);
                  setBudget(newBudget);
                  saveBudget(newBudget);
                  setShowBudgetModal(false);
                }}
                style={[styles.modalButton, { backgroundColor: '#2a9d8f' }]}
              >
                <Text style={{ color: '#fff' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthText: { fontSize: 20, fontWeight: '700', color: '#111' },
  navArrow: { padding: 8 },
  summaryTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    paddingVertical: 12,
    marginBottom: 20,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#111' },
  tabLabel: { fontSize: 14, color: '#666' },
  tabValue: { fontSize: 18, fontWeight: '700', color: '#111' },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
});
