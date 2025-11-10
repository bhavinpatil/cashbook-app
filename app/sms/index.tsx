// app/sms/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useSmsTransactions } from '@/hooks/useSmsTransactions';
import { getMonthKey, parseSmsMessage } from '@/utils/smsUtils';
import SmsSummaryChart from '@/components/sms/SmsSummaryChart';
import { SmsTransaction } from '@/types/sms';
import SmsFilterPanel from '@/components/sms/SmsFilterPanel';

import { mockSmsMessages } from '@/utils/mockSmsData';

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SmsTransactionsScreen() {
  const { theme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(getMonthKey());
  const { transactions, getTotals, loading, updateCategory, addTransaction } =
    useSmsTransactions(currentMonth);
  const totals = getTotals();

  const [selectedItem, setSelectedItem] = useState<SmsTransaction | null>(null);

  const changeMonth = (offset: number) => {
    const [y, m] = currentMonth.split('_').map(Number);
    const date = new Date(y, m - 1 + offset, 1);
    setCurrentMonth(getMonthKey(date));
  };

  const [filters, setFilters] = useState<any>({});
  const filteredTransactions = transactions
    .filter(t => filters.type && filters.type !== 'All' ? t.type === filters.type : true)
    .sort((a, b) => {
      if (filters.sort === 'Amount') return b.amount - a.amount;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  async function clearSmsData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const smsKeys = keys.filter(k => k.includes("sms_transactions_"));
      if (smsKeys.length === 0) {
        alert("✅ No SMS data found to clear.");
        return;
      }
      await AsyncStorage.multiRemove(smsKeys);
      alert(`🧹 Cleared ${smsKeys.length} SMS data sets successfully!`);
    } catch (err) {
      console.error("Failed to clear SMS data:", err);
      alert("❌ Failed to clear SMS data.");
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
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Ionicons name="chevron-back" size={24} color={theme.textDark} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: theme.textDark }]}>
          {currentMonth.replace('_', '-')}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Ionicons name="chevron-forward" size={24} color={theme.textDark} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View
        style={[
          styles.summary,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
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

      {__DEV__ && (
        <View style={styles.devButtonRow}>
          {/* Import Mock SMS Button */}
          <TouchableOpacity
            style={[styles.importButton, { backgroundColor: theme.primary, flex: 1 }]}
            onPress={async () => {
              let added = 0;
              for (const mock of mockSmsMessages) {
                const parsed = parseSmsMessage(mock.message, mock.sender, mock.date);
                if (parsed) {
                  const smsMonthKey = getMonthKey(new Date(mock.date));
                  await addTransaction(parsed, smsMonthKey);
                  added++;
                }
              }
              alert(`✅ Imported ${added} mock SMS messages successfully!`);
            }}
          >
            <Ionicons name="cloud-download-outline" size={20} color="#fff" />
            <Text style={styles.importButtonText}>Import Mock SMS</Text>
          </TouchableOpacity>

          {/* Clear Mock SMS Button */}
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: theme.danger, flex: 1 }]}
            onPress={clearSmsData}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.importButtonText}>Clear Mock SMS</Text>
          </TouchableOpacity>
        </View>
      )}


      <SmsFilterPanel onApply={setFilters} />

      {/* Category Summary Chart */}
      <SmsSummaryChart transactions={filteredTransactions} />

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedItem(item)}
            style={[
              styles.item,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.rowBetween}>
              <Text
                style={[
                  styles.amount,
                  {
                    color:
                      item.type === 'Credit' ? theme.success : theme.danger,
                  },
                ]}
              >
                ₹{item.amount.toFixed(2)}
              </Text>
              {item.category && (
                <Text style={[styles.category, { color: theme.primary }]}>
                  🏷 {item.category}
                </Text>
              )}
            </View>
            <Text
              style={[styles.message, { color: theme.textDark }]}
              numberOfLines={2}
            >
              {item.message}
            </Text>
            <Text style={[styles.date, { color: theme.textLight }]}>
              {new Date(item.date).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text
            style={{
              color: theme.textLight,
              textAlign: 'center',
              marginTop: 50,
            }}
          >
            No transactions for this month.
          </Text>
        }
      />

      {/* Category Picker Modal */}
      {selectedItem && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.textDark }]}>
              Categorize Transaction
            </Text>
            {['Groceries', 'Bills', 'Fuel', 'Travel', 'Food', 'Other'].map(
              (cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    updateCategory(selectedItem.id, cat);
                    setSelectedItem(null);
                  }}
                  style={[
                    styles.catButton,
                    { borderColor: theme.border, backgroundColor: theme.card },
                  ]}
                >
                  <Text style={{ color: theme.textDark }}>{cat}</Text>
                </TouchableOpacity>
              )
            )}
            <TouchableOpacity onPress={() => setSelectedItem(null)}>
              <Text
                style={{
                  color: theme.danger,
                  textAlign: 'center',
                  marginTop: 10,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: { fontSize: 18, fontWeight: '600' },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  summaryText: { fontSize: 15, fontWeight: '600' },
  item: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 10 },
  amount: { fontSize: 16, fontWeight: '700' },
  message: { fontSize: 14, marginTop: 4 },
  date: { fontSize: 12, marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  category: { fontSize: 13, fontWeight: '600' },

  // Modal styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  catButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 4,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  importButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  devButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
});
