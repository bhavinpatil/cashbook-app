// components/sms/ImportSmsModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { readRawSmsInbox } from '@/utils/smsReader';
import { parseSmsMessage, getMonthKey } from '@/utils/smsUtils';
import type { SmsTransaction } from '@/types/sms';

type RawSms = {
  _id: string;
  address?: string;
  body: string;
  date: string; // epoch millis as string
  thread_id?: string;
  type?: string;
};

export default function ImportSmsModal({
  visible,
  onClose,
  onImport, // optional callback when import completes (returns number imported)
  addTransactions, // from hook: (txs, targetKey?) => Promise<void>
}: {
  visible: boolean;
  onClose: () => void;
  onImport?: (count: number) => void;
  addTransactions: (txs: SmsTransaction[], targetKey?: string) => Promise<void>;
}) {
  const { theme } = useTheme();

  // Loading / error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Raw messages loaded
  const [allRawMessages, setAllRawMessages] = useState<RawSms[]>([]);

  // Selection state: map of raw message _id => boolean
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  // Which main accordion is open: 'today' | 'last7'
  const [openMain, setOpenMain] = useState<'today' | 'last7'>('today');

  // Which specific day in last7 is expanded (format: 'YYYY-MM-DD'), or null
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null);

  // When modal opens -> load SMS (we will read inbox once and derive groups)
  useEffect(() => {
    if (!visible) return;
    // Reset states
    setSelectedIds({});
    setError(null);
    setOpenMain('today');
    setExpandedDayKey(null);
    loadAllSms(); // reads inbox and prepares groups
    // cleanup when closed
    return () => {
      setAllRawMessages([]);
      setSelectedIds({});
      setError(null);
      setLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Reads inbox and sets allRawMessages
  const loadAllSms = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise<void>((res, rej) => {
        readRawSmsInbox(
          (raw: RawSms[]) => {
            // sort newest first
            const msgs = (raw || []).slice().sort((a, b) => Number(b.date) - Number(a.date));
            setAllRawMessages(msgs);
            res();
          },
          (err) => {
            console.error('readRawSmsInbox err', err);
            setError('Failed to fetch SMS from device.');
            rej(err);
          }
        );
      });
    } catch (e) {
      // error already set
    } finally {
      setLoading(false);
    }
  };

  // Refresh behavior: keep it limited to reloading inbox and keeping same UI state
  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      await loadAllSms();
    } finally {
      setLoading(false);
    }
  };

  // Helper: format date key 'YYYY-MM-DD'
  const toDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // Today key
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  // Build groups:
  // - todayMessages: array of RawSms for today (ordered newest first)
  // - last7DaysMap: Record<dateKey, RawSms[]> for previous 7 days (1..7 days ago), each ordered newest-first
  const { todayMessages, last7DaysMap, last7DaysOrder } = useMemo(() => {
    const msgs = allRawMessages || [];
    const todayMsgs: RawSms[] = [];
    const last7: Record<string, RawSms[]> = {};

    // build set of last 7 date keys (exclude today)
    const dateKeys: string[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateKeys.push(toDateKey(d));
    }

    for (const m of msgs) {
      try {
        const d = new Date(Number(m.date));
        const key = toDateKey(d);
        if (key === todayKey) {
          todayMsgs.push(m);
        } else if (dateKeys.includes(key)) {
          last7[key] = last7[key] || [];
          last7[key].push(m);
        }
      } catch {
        // ignore parse errors
      }
    }

    // Ensure each day's list sorted newest -> oldest
    Object.keys(last7).forEach(k => last7[k].sort((a, b) => Number(b.date) - Number(a.date)));
    todayMsgs.sort((a, b) => Number(b.date) - Number(a.date));

    return { todayMessages: todayMsgs, last7DaysMap: last7, last7DaysOrder: dateKeys };
  }, [allRawMessages, todayKey]);

  // Helper: flatten messages for currently expanded context (for Select All behavior)
  const currentExpandedMessageIds = useMemo(() => {
    if (openMain === 'today') {
      return todayMessages.map(m => m._id);
    }
    // last7 open:
    if (expandedDayKey) {
      return (last7DaysMap[expandedDayKey] || []).map(m => m._id);
    }
    return [];
  }, [openMain, expandedDayKey, last7DaysMap, todayMessages]);

  // Select/unselect specific message id
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = { ...prev, [id]: !prev[id] };
      return next;
    });
  };

  // Global Select All (context-aware Option B)
  const toggleSelectAll = () => {
    const ids = currentExpandedMessageIds;
    if (!ids || ids.length === 0) return;

    const allSelected = ids.every(id => selectedIds[id]);
    if (allSelected) {
      // unselect these ids
      setSelectedIds(prev => {
        const copy = { ...prev };
        ids.forEach(id => delete copy[id]);
        return copy;
      });
    } else {
      // select these ids
      setSelectedIds(prev => {
        const copy = { ...prev };
        ids.forEach(id => (copy[id] = true));
        return copy;
      });
    }
  };

  // Import selected messages: same logic as before but now selection can be across days
  const handleImportSelected = async () => {
    // gather chosen raw messages across both today and last7
    const chosenRaw = [
      ...todayMessages,
      ...Object.values(last7DaysMap).flat(),
    ].filter(m => !!selectedIds[m._id]);

    if (chosenRaw.length === 0) {
      alert('Please select at least one message to import.');
      return;
    }

    setLoading(true);
    try {
      const parsedTxs: SmsTransaction[] = [];
      for (const m of chosenRaw) {
        const iso = new Date(Number(m.date)).toISOString();
        const parsed = parseSmsMessage(m.body, m.address ?? 'unknown', iso);
        if (parsed) parsedTxs.push(parsed);
      }

      if (parsedTxs.length === 0) {
        alert('No parsable transaction messages selected.');
        setLoading(false);
        return;
      }

      // group by month and call addTransactions per month
      const byMonth: Record<string, SmsTransaction[]> = {};
      parsedTxs.forEach(tx => {
        const mk = getMonthKey(new Date(tx.date));
        byMonth[mk] = byMonth[mk] || [];
        byMonth[mk].push(tx);
      });

      let totalAdded = 0;
      for (const mk of Object.keys(byMonth)) {
        await addTransactions(byMonth[mk], mk);
        totalAdded += byMonth[mk].length;
      }

      alert(`✅ Imported ${totalAdded} transactions.`);
      onImport?.(totalAdded);
      onClose();
    } catch (err) {
      console.error('Import Selected Error', err);
      alert('❌ Failed to import selected messages.');
    } finally {
      setLoading(false);
    }
  };

  // Render helpers
  const renderSmsRow = (item: RawSms) => {
    const isSel = !!selectedIds[item._id];
    const time = new Date(Number(item.date)).toLocaleTimeString();
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => toggleSelect(item._id)}
        style={[styles.smsRow, { borderColor: theme.border, backgroundColor: theme.card }]}
        key={item._id}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name={isSel ? 'checkbox' : 'square-outline'} size={20} color={theme.textDark} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text numberOfLines={1} style={{ color: theme.textDark, fontWeight: '600' }}>
              {item.address ?? 'Unknown'}
            </Text>
            <Text numberOfLines={2} style={{ color: theme.textLight, marginTop: 4 }}>
              {item.body}
            </Text>
          </View>
          <Text style={{ color: theme.textLight, marginLeft: 8 }}>{time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Utility: readable date label from dateKey 'YYYY-MM-DD'
  const labelFromKey = (k: string) => {
    const [y, m, d] = k.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toDateString(); // e.g. 'Sun Nov 16 2025'
  };

  // Whether Select All button should be enabled (context-aware)
  const selectAllEnabled = currentExpandedMessageIds.length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={styles.safe}>
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {/* Title + close */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.textDark }]}>Import SMS (Today + Last 7 Days)</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color={theme.textLight} />
              </TouchableOpacity>
            </View>

            {/* Actions row: context-aware Select All + Refresh */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => {
                  // Only toggle if some context messages exist
                  if (!selectAllEnabled) return;
                  toggleSelectAll();
                }}
                style={[
                  styles.actionBtn,
                  { borderColor: theme.border, opacity: selectAllEnabled ? 1 : 0.5 },
                ]}
              >
                <Ionicons
                  name={selectAllEnabled && currentExpandedMessageIds.every(id => selectedIds[id]) ? 'checkbox' : 'square-outline'}
                  size={18}
                  color={theme.textDark}
                />
                <Text style={[styles.actionText, { color: theme.textDark }]}>Select All</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={refresh} style={[styles.actionBtn, { borderColor: theme.border }]}>
                <Ionicons name="reload" size={18} color={theme.textDark} />
                <Text style={[styles.actionText, { color: theme.textDark }]}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {/* Body: accordions */}
            {loading ? (
              <View style={{ padding: 20 }}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            ) : error ? (
              <Text style={{ color: 'red', textAlign: 'center', marginVertical: 10 }}>{error}</Text>
            ) : (
              <ScrollView style={{ maxHeight: 540 }}>
                {/* Today Accordion */}
                <View>
                  <TouchableOpacity
                    style={[styles.sectionHeader, { borderColor: theme.border, backgroundColor: theme.card }]}
                    onPress={() => {
                      setOpenMain(prev => (prev === 'today' ? 'today' : 'today'));
                      // ensure expandedDayKey cleared because we are in Today context
                      setExpandedDayKey(null);
                      setOpenMain('today');
                    }}
                    activeOpacity={0.8}
                    key="today-header"
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name={openMain === 'today' ? 'chevron-down' : 'chevron-forward'} size={18} color={theme.textDark} />
                      <Text style={[styles.sectionTitle, { color: theme.textDark, marginLeft: 8 }]}>
                        Today ({todayMessages.length})
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {openMain === 'today' && todayMessages.length > 0 && (
                    <View style={{ paddingHorizontal: 6, paddingBottom: 8 }}>
                      {todayMessages.map(m => (
                        <View key={m._id}>{renderSmsRow(m)}</View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Last 7 Days Accordion */}
                <View>
                  <TouchableOpacity
                    style={[styles.sectionHeader, { borderColor: theme.border, backgroundColor: theme.card }]}
                    onPress={() => {
                      setOpenMain(prev => (prev === 'last7' ? 'today' : 'last7'));
                      // when toggling last7 open, clear expanded day if closing
                      if (openMain === 'last7') setExpandedDayKey(null);
                    }}
                    activeOpacity={0.8}
                    key="last7-header"
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name={openMain === 'last7' ? 'chevron-down' : 'chevron-forward'} size={18} color={theme.textDark} />
                      <Text style={[styles.sectionTitle, { color: theme.textDark, marginLeft: 8 }]}>
                        Last 7 Days
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {openMain === 'last7' && (
                    <View style={{ paddingHorizontal: 6, paddingBottom: 8 }}>
                      {/* render each day (in order last7DaysOrder) */}
                      {last7DaysOrder.map((dayKey) => {
                        const list = last7DaysMap[dayKey] || [];
                        const isExpanded = expandedDayKey === dayKey;
                        return (
                          <View key={dayKey}>
                            <TouchableOpacity
                              style={[styles.dayHeader, { borderColor: theme.border, backgroundColor: theme.card }]}
                              onPress={() => {
                                // toggle expand for this day
                                setExpandedDayKey(prev => (prev === dayKey ? null : dayKey));
                                // switch main to last7 (already is) — no-op
                                setOpenMain('last7');
                              }}
                              activeOpacity={0.85}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name={isExpanded ? 'chevron-down' : 'chevron-forward'} size={16} color={theme.textDark} />
                                <Text style={[styles.dayLabel, { color: theme.textDark, marginLeft: 8 }]}>
                                  {labelFromKey(dayKey)} ({list.length})
                                </Text>
                              </View>
                            </TouchableOpacity>

                            {isExpanded && list.length > 0 && (
                              <View style={{ paddingLeft: 18, paddingTop: 6 }}>
                                {list.map(m => (
                                  <View key={m._id}>{renderSmsRow(m)}</View>
                                ))}
                              </View>
                            )}
                          </View>
                        );
                      })}
                      {/* If no messages in last7 at all */}
                      {last7DaysOrder.every(k => (last7DaysMap[k] || []).length === 0) && (
                        <Text style={{ color: theme.textLight, textAlign: 'center', marginVertical: 10 }}>
                          No messages in the last 7 days.
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </ScrollView>
            )}

            {/* Footer buttons */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={onClose} style={[styles.footerBtn, { borderColor: theme.border }]}>
                <Text style={{ color: theme.textDark }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleImportSelected}
                style={[styles.footerBtnPrimary, { backgroundColor: theme.primary }]}
                disabled={loading || Object.keys(selectedIds).length === 0}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Import Selected</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    borderRadius: 14,
    padding: 12,
    maxHeight: '88%',
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, borderWidth: 1, borderRadius: 8 },
  actionText: { marginLeft: 6, fontWeight: '600' },
  smsRow: { borderWidth: 1, borderRadius: 10, padding: 10, marginVertical: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  footerBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, marginRight: 8, alignItems: 'center' },
  footerBtnPrimary: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', marginLeft: 8 },

  // section styles
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },

  dayHeader: { flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1, borderRadius: 10, marginBottom: 6 },
  dayLabel: { fontSize: 14, fontWeight: '600' },
});
