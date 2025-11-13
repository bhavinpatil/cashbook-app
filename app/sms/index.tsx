// app/sms/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useSmsTransactions } from '@/hooks/useSmsTransactions';
import { getMonthKey } from '@/utils/smsUtils';
import SmsSummaryChart from '@/components/sms/SmsSummaryChart';
import { SmsTransaction } from '@/types/sms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImportSmsModal from '@/components/sms/ImportSmsModal';
import FilterBottomSheet from '@/components/sms/FilterBottomSheet';
import { requestReadSmsPermission } from '@/utils/androidPermissions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SmsTransactionsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // date state (day navigation)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const currentMonth = getMonthKey(currentDate);

  // hook (month-storage)
  const {
    transactions: monthTransactions,
    getTotals,
    loading,
    updateCategory,
    addTransactions,
  } = useSmsTransactions(currentMonth);

  const totals = getTotals();

  // UI states
  const [selectedItem, setSelectedItem] = useState<SmsTransaction | null>(null);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [insightsMode, setInsightsMode] = useState<'Daily' | 'Monthly'>('Daily');

  // helper: same day
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  // derived lists
  const dayTransactions = monthTransactions.filter((t) => isSameDay(new Date(t.date), currentDate));
  const monthListTransactions = monthTransactions.slice();

  // which list to show in the flatlist depending on mode
  const visibleList = insightsMode === 'Daily' ? dayTransactions : monthListTransactions;

  // apply filters client-side
  const filteredTransactions = visibleList
    .filter((t) => (filters.type && filters.type !== 'All' ? t.type === filters.type : true))
    .sort((a, b) => {
      if (filters.sort === 'Amount') return b.amount - a.amount;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  // show chart using mode selection
  const chartTransactions = insightsMode === 'Daily' ? dayTransactions : monthListTransactions;

  // update months available from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const smsKeys = keys
          .filter((k) => k.startsWith('sms_transactions_'))
          .map((k) => k.replace('sms_transactions_', ''))
          .sort();
        const cur = getMonthKey(new Date());
        const uniq = Array.from(new Set([...smsKeys, cur])).sort();
        setAvailableMonths(uniq.reverse());
      } catch (e) {
        console.error('Failed to load month keys', e);
      }
    })();
  }, [monthTransactions]);

  // month change via dropdown (string key like '2025_11')
  const changeMonthTo = (mk: string) => {
    const [y, m] = mk.split('_').map(Number);
    const cand = new Date(y, m - 1, 1);
    if (cand > new Date()) return;
    // set currentDate to first day of that month to keep day nav consistent
    setCurrentDate(new Date(y, m - 1, 1));
    setMonthPickerOpen(false);
  };

  // day navigation
  const goDay = (delta: number) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta);
      const now = new Date();
      if (next > now) return prev;
      return next;
    });
  };

  // Import handler
  const onImportPress = async () => {
    const ok = await requestReadSmsPermission();
    if (!ok) {
      alert('Permission denied');
      return;
    }
    setImportModalVisible(true);
  };

  const onAfterImport = async () => {
    // refresh month keys and jump to today after import
    try {
      const keys = await AsyncStorage.getAllKeys();
      const smsKeys = keys
        .filter((k) => k.startsWith('sms_transactions_'))
        .map((k) => k.replace('sms_transactions_', ''));
      const uniq = Array.from(new Set([...smsKeys, getMonthKey(new Date())])).sort();
      setAvailableMonths(uniq.reverse());
      setCurrentDate(new Date());
    } catch (e) {
      console.error('refresh months after import', e);
    }
  };

  // clear storage helper
  async function clearSmsData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const smsKeys = keys.filter((k) => k.includes('sms_transactions_'));
      if (smsKeys.length === 0) {
        alert('✅ No SMS data found to clear.');
        return;
      }
      await AsyncStorage.multiRemove(smsKeys);
      alert(`🧹 Cleared ${smsKeys.length} SMS data sets successfully!`);
      setAvailableMonths([getMonthKey(new Date())]);
      setCurrentDate(new Date());
    } catch (err) {
      console.error('Failed to clear SMS data:', err);
      alert('❌ Failed to clear SMS data.');
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMonthPickerOpen((v) => !v)}>
          <Ionicons name="calendar-outline" size={22} color={theme.textDark} />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={() => goDay(-1)}>
            <Ionicons name="chevron-back" size={22} color={theme.textDark} />
          </TouchableOpacity>

          <Text style={[styles.headerText, { color: theme.textDark }]}>
            {currentDate.toDateString()}
          </Text>

          <TouchableOpacity onPress={() => goDay(1)}>
            <Ionicons name="chevron-forward" size={22} color={theme.textDark} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => { setCurrentDate(new Date()); setMonthPickerOpen(false); }}>
          <Ionicons name="today-outline" size={22} color={theme.textDark} />
        </TouchableOpacity>
      </View>

      {/* Month dropdown */}
      {monthPickerOpen && (
        <View style={[styles.monthList, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <FlatList
            data={availableMonths}
            keyExtractor={(i) => i}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => changeMonthTo(item)} style={styles.monthItem}>
                <Text style={{ color: theme.textDark }}>{item.replace('_', '-')}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ color: theme.textLight, padding: 8 }}>No months found</Text>}
          />
        </View>
      )}

      {/* Summary */}
      <View style={[styles.summary, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.summaryText, { color: theme.success }]}>
          Credit: ₹{totals.credit.toFixed(2)}
        </Text>
        <Text style={[styles.summaryText, { color: theme.danger }]}>
          Debit: ₹{totals.debit.toFixed(2)}
        </Text>
        <Text style={[styles.summaryText, { color: theme.textDark }]}>
          Balance: ₹{totals.balance.toFixed(2)}
        </Text>
      </View>

      {/* Actions: Import + Toggle */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.importButton, { backgroundColor: theme.primary }]} onPress={onImportPress}>
          <Ionicons name="mail-outline" size={18} color="#fff" />
          <Text style={styles.importButtonText}>Import From Device</Text>
        </TouchableOpacity>

        <View style={styles.toggleWrap}>
          <TouchableOpacity
            onPress={() => setInsightsMode('Daily')}
            style={[styles.toggleBtn, { backgroundColor: insightsMode === 'Daily' ? theme.primary : 'transparent' }]}
          >
            <Ionicons name="sunny-outline" size={16} color={insightsMode === 'Daily' ? '#fff' : theme.textDark} />
            <Text style={[styles.toggleText, { color: insightsMode === 'Daily' ? '#fff' : theme.textDark }]}>Daily</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setInsightsMode('Monthly')}
            style={[styles.toggleBtn, { backgroundColor: insightsMode === 'Monthly' ? theme.primary : 'transparent' }]}
          >
            <Ionicons name="calendar-outline" size={16} color={insightsMode === 'Monthly' ? '#fff' : theme.textDark} />
            <Text style={[styles.toggleText, { color: insightsMode === 'Monthly' ? '#fff' : theme.textDark }]}>Monthly</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chart */}
      <SmsSummaryChart transactions={chartTransactions} />

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedItem(item)}
            style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}
            activeOpacity={0.85}
          >
            <View style={styles.rowBetween}>
              <Text style={[styles.amount, { color: item.type === 'Credit' ? theme.success : theme.danger }]}>
                ₹{item.amount.toFixed(2)}
              </Text>
              {item.category && <Text style={[styles.category, { color: theme.primary }]}>🏷 {item.category}</Text>}
            </View>

            <Text style={[styles.message, { color: theme.textDark }]} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={[styles.date, { color: theme.textLight }]}>{new Date(item.date).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ color: theme.textLight, textAlign: 'center', marginTop: 50 }}>
            No transactions for this {insightsMode === 'Daily' ? 'day' : 'month'}.
          </Text>
        }
      />

      {/* Categorize modal */}
      {selectedItem && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.textDark }]}>Categorize Transaction</Text>
            {['Groceries', 'Bills', 'Fuel', 'Travel', 'Food', 'Other'].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  updateCategory(selectedItem.id, cat);
                  setSelectedItem(null);
                }}
                style={[styles.catButton, { borderColor: theme.border, backgroundColor: theme.card }]}
              >
                <Text style={{ color: theme.textDark }}>{cat}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setSelectedItem(null)}>
              <Text style={{ color: theme.danger, textAlign: 'center', marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Import Modal */}
      <ImportSmsModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        addTransactions={addTransactions}
        onImport={onAfterImport}
      />

      {/* Filter bottom sheet */}
      <FilterBottomSheet
        visible={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        onApply={(f) => {
          setFilters(f);
          setFilterSheetOpen(false);
        }}
      />

      {/* Floating Filter FAB */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setFilterSheetOpen(true)}
        style={[
          styles.fab,
          {
            right: 16,
            bottom: Math.max(insets.bottom, 16) + 8,
            backgroundColor: theme.primary,
            // elevation shadow
            ...Platform.select({
              android: { elevation: 6 },
              ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 },
            }),
          },
        ]}
      >
        <Ionicons name="filter" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerText: { fontSize: 16, fontWeight: '600' },
  summary: { flexDirection: 'row', justifyContent: 'space-around', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10 },
  summaryText: { fontSize: 14, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  importButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, flex: 1, marginRight: 8, justifyContent: 'center' },
  importButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  toggleWrap: { flexDirection: 'row', borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  toggleText: { marginLeft: 6, fontWeight: '600' },

  item: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 10 },
  amount: { fontSize: 16, fontWeight: '700' },
  message: { fontSize: 14, marginTop: 4 },
  date: { fontSize: 12, marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  category: { fontSize: 13, fontWeight: '600' },

  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '80%', borderRadius: 16, padding: 20, elevation: 6 },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  catButton: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginVertical: 4 },

  monthList: { borderWidth: 1, borderRadius: 10, marginVertical: 8, maxHeight: 220 },
  monthItem: { padding: 10, borderBottomWidth: 1 },

  // FAB
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
