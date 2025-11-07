import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FuelEntry } from '@/hooks/useFuel';

type Props = {
  entries: FuelEntry[];
  onDelete?: (id: string) => void;
  onAddOdometer?: (entry: FuelEntry) => void;
};

export default function FuelList({ entries = [], onDelete, onAddOdometer }: Props) {
  const computed = useMemo(() => {
    const arr = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return arr
      .map((e, idx) => {
        const prev = idx > 0 ? arr[idx - 1] : undefined;
        const distance =
          e.distance ??
          (prev && typeof e.odometer === 'number' && typeof prev.odometer === 'number'
            ? e.odometer - prev.odometer
            : undefined);
        const mileage =
          distance && e.liters ? +(distance / e.liters).toFixed(2) : undefined;
        return { ...e, distance, mileage };
      })
      .reverse();
  }, [entries]);

  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: '#666' }}>No fuel entries yet. Tap + to add.</Text>
      </View>
    );
  }

  const confirmDelete = (id: string) => {
    Alert.alert('Delete', 'Remove this fuel entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete && onDelete(id) },
    ]);
  };

  return (
    <FlatList
      data={computed}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ padding: 12 }}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
            <Text style={styles.small}>
              Odo: {item.odometer ?? '—'} km — ₹{item.amount} — {item.liters} L
            </Text>
            <Text style={styles.small}>
              {item.distance !== undefined
                ? `Distance: ${item.distance} km`
                : 'Distance: —'}{' '}
              •{' '}
              {item.mileage !== undefined
                ? `Mileage: ${item.mileage} km/L`
                : 'Mileage: —'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onAddOdometer?.(item)}
          >
            <Ionicons
              name={
                item.hasOdometer ? 'create-outline' : 'speedometer-outline'
              }
              size={20}
              color={item.hasOdometer ? '#007aff' : '#ff9500'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => confirmDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#b71c1c" />
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: { padding: 20, alignItems: 'center' },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
    alignItems: 'center',
  },
  date: { fontSize: 16, fontWeight: '600' },
  small: { color: '#666', fontSize: 13, marginTop: 4 },
  actionBtn: { marginLeft: 8, padding: 8 },
});
