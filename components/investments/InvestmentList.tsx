// components/investments/InvestmentList.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import dayjs from 'dayjs';
import { Investment } from '@/hooks/useInvestmentsStore';
import { useTheme } from '@/contexts/ThemeContext';

export default function InvestmentList({
  items,
  onEdit,
  onDelete,
}: {
  items: Investment[];
  onEdit: (i: Investment) => void;
  onDelete: (id: string) => void;
}) {
  const { theme } = useTheme();

  const render = ({ item }: { item: Investment }) => {
    const value = item.units && item.pricePerUnit ? item.units * item.pricePerUnit : item.amount;
    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.desc, { color: theme.textDark }]}>{item.description || item.type}</Text>
          <Text style={{ color: theme.textLight, marginTop: 4 }}>{dayjs(item.date).format('DD MMM YYYY')}</Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.amount, { color: theme.primary }]}>₹{Number(value || 0).toLocaleString()}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TouchableOpacity onPress={() => onEdit(item)} style={styles.action}>
              <Text style={{ color: theme.textDark }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              Alert.alert('Delete', 'Remove investment?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) }
              ]);
            }} style={styles.action}>
              <Text style={{ color: theme.danger }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (!items.length) {
    return <Text style={{ color: theme.textLight, textAlign: 'center', marginTop: 20 }}>No investments this month.</Text>;
  }

  return <FlatList data={items.sort((a,b)=> +new Date(b.date) - +new Date(a.date))} renderItem={render} keyExtractor={(i)=>i.id} contentContainerStyle={{ paddingBottom: 80 }} />;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  desc: { fontSize: 15, fontWeight: '600' },
  amount: { fontSize: 15, fontWeight: '700' },
  action: { paddingHorizontal: 8 },
});
