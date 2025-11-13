// components/sms/ImportSmsModal.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
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
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<RawSms[]>([]);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    loadTodaysSms();
    // reset selection when modal opens
    return () => {
      setMessages([]);
      setSelectedIds({});
      setSelectAll(false);
      setError(null);
    };
  }, [visible]);

  const loadTodaysSms = async () => {
    setLoading(true);
    setError(null);
    try {
      // read raw sms (maxCount default inside util)
      await new Promise<void>((res, rej) => {
        readRawSmsInbox(
          (raw) => {
            // filter to today's messages
            const todayStr = new Date().toDateString();
            const todayMsgs = raw.filter((m: RawSms) => {
              try {
                const d = new Date(Number(m.date));
                return d.toDateString() === todayStr;
              } catch {
                return false;
              }
            }).sort((a: RawSms, b: RawSms) => Number(b.date) - Number(a.date));
            setMessages(todayMsgs);
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
      // error handled above
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = { ...prev, [id]: !prev[id] };
      // update selectAll flag
      const allSelected = messages.length > 0 && messages.every(m => next[m._id]);
      setSelectAll(allSelected);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds({});
      setSelectAll(false);
    } else {
      const map: Record<string, boolean> = {};
      messages.forEach(m => (map[m._id] = true));
      setSelectedIds(map);
      setSelectAll(true);
    }
  };

  const handleImportSelected = async () => {
    const chosen = messages.filter(m => selectedIds[m._id]);
    if (chosen.length === 0) {
      alert('Please select at least one message to import.');
      return;
    }
    setLoading(true);
    try {
      const parsedTxs: SmsTransaction[] = [];
      for (const m of chosen) {
        // parse using existing parser — parseSmsMessage returns SmsTransaction | null
        const iso = new Date(Number(m.date)).toISOString();
        const parsed = parseSmsMessage(m.body, m.address ?? 'unknown', iso);
        if (parsed) parsedTxs.push(parsed);
      }

      if (parsedTxs.length === 0) {
        alert('No parsable transaction messages selected.');
        setLoading(false);
        return;
      }

      // group by month and call addTransactions per month (to avoid mixing months)
      const byMonth: Record<string, SmsTransaction[]> = {};
      parsedTxs.forEach(tx => {
        const mk = getMonthKey(new Date(tx.date));
        byMonth[mk] = byMonth[mk] || [];
        byMonth[mk].push(tx);
      });

      // bulk add per month
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

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={styles.safe}>
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.textDark }]}>
                Import Today's SMS
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color={theme.textLight} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={toggleSelectAll} style={[styles.actionBtn, { borderColor: theme.border }]}>
                <Ionicons name={selectAll ? 'checkbox' : 'square-outline'} size={18} color={theme.textDark} />
                <Text style={[styles.actionText, { color: theme.textDark }]}>
                  {selectAll ? 'Unselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={loadTodaysSms}
                style={[styles.actionBtn, { borderColor: theme.border }]}
              >
                <Ionicons name="reload" size={18} color={theme.textDark} />
                <Text style={[styles.actionText, { color: theme.textDark }]}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={{ padding: 20 }}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            ) : error ? (
              <Text style={{ color: 'red', textAlign: 'center', marginVertical: 10 }}>{error}</Text>
            ) : messages.length === 0 ? (
              <Text style={{ color: theme.textLight, textAlign: 'center', marginVertical: 20 }}>
                No SMS found for today.
              </Text>
            ) : (
              <FlatList
                data={messages}
                keyExtractor={(i) => i._id}
                style={{ maxHeight: 360 }}
                renderItem={({ item }) => {
                  const isSel = !!selectedIds[item._id];
                  const time = new Date(Number(item.date)).toLocaleTimeString();
                  return (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => toggleSelect(item._id)}
                      style={[styles.smsRow, { borderColor: theme.border, backgroundColor: theme.card }]}
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
                }}
              />
            )}

            <View style={styles.footer}>
              <TouchableOpacity onPress={onClose} style={[styles.footerBtn, { borderColor: theme.border }]}>
                <Text style={{ color: theme.textDark }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleImportSelected}
                style={[styles.footerBtnPrimary, { backgroundColor: theme.primary }]}
                disabled={loading || messages.length === 0}
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
});
