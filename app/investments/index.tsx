// app/investments/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import dayjs from 'dayjs';
import ScreenTitle from '@/components/ui/ScreenTitle';
import { useTheme } from '@/contexts/ThemeContext';
import { useInvestmentsStore, Investment } from '@/hooks/useInvestmentsStore';

import InvestmentSummaryTabs from '@/components/investments/InvestmentSummaryTabs';
import InvestmentMonthHeader from '@/components/investments/InvestmentMonthHeader';
import InvestmentPieCharts from '@/components/investments/InvestmentPieCharts';
import InvestmentGraph from '@/components/investments/InvestmentGraph';
import InvestmentList from '@/components/investments/InvestmentList';
import AddInvestmentModal from '@/components/investments/AddInvestmentModal';

export default function InvestmentsScreen() {
  const { theme } = useTheme();
  const store = useInvestmentsStore();

  const [all, setAll] = useState<Investment[]>([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [activeType, setActiveType] = useState<'All' | any>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Investment | null>(null);
  const [trend, setTrend] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });

  // Load all data
  const load = useCallback(async () => {
    const list = await store.loadAll();
    setAll(list);

    const t = await store.getTotalsByType();
    setTotals(t);

    const tr = await store.getMonthlyTrend(6);
    setTrend(tr);
  }, []);

  useEffect(() => {
    load();
  }, []);

  // Filters
  const monthItems = all.filter((i) => dayjs(i.date).isSame(currentMonth, 'month'));
  const filteredMonthItems = activeType === 'All'
    ? monthItems
    : monthItems.filter((i) => i.type === activeType);

  const overallFiltered = activeType === 'All'
    ? all
    : all.filter((i) => i.type === activeType);

  // Add/Update/Delete handlers
  const handleAdd = async (payload: any) => {
    await store.add(payload);
    setAddOpen(false);
    load();
  };

  const handleUpdate = async (payload: any) => {
    await store.update(payload.id, payload);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    await store.remove(id);
    load();
  };

  // ===== FlatList Header =====
  const Header = () => (
    <View>
      {/* Title + Add Button */}
      <View style={styles.headerRow}>
        <ScreenTitle>Investments</ScreenTitle>

        <TouchableOpacity
          onPress={() => { setEditing(null); setAddOpen(true); }}
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Tabs */}
      <InvestmentSummaryTabs
        totals={totals}
        active={activeType}
        onSelectType={(t) => setActiveType(t)}
      />

      {/* Month Selector */}
      <InvestmentMonthHeader
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
      />

      {/* Pie Charts */}
      <InvestmentPieCharts
        all={overallFiltered}
        month={filteredMonthItems}
      />

      {/* Graph Section */}
      <InvestmentGraph
        all={overallFiltered}
        month={filteredMonthItems}
        monthlyTrend={trend}
      />

      {/* List section title */}
      <Text style={[styles.sectionTitle, { color: theme.textDark }]}>
        Transactions — {currentMonth.format('MMMM YYYY')}
      </Text>
    </View>
  );

  return (
    <>
      <FlatList
        data={filteredMonthItems.sort(
          (a, b) => +new Date(b.date) - +new Date(a.date)
        )}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={Header}
        renderItem={({ item }) => (
          <InvestmentList
            items={[item]}
            onEdit={(i) => { setEditing(i); setAddOpen(true); }}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
        style={[styles.container, { backgroundColor: theme.background }]}
      />

      {/* Add/Edit Modal */}
      <AddInvestmentModal
        visible={addOpen}
        initial={editing}
        onClose={() => { setAddOpen(false); setEditing(null); }}
        onSave={(p) => {
          if (editing) handleUpdate(p);
          else handleAdd(p);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  addBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 10, marginBottom: 8 },
});