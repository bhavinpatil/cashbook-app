// components/trips/TripList.tsx
import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '@/hooks/useTrips';
import { useTheme } from '@/contexts/ThemeContext';

type Props = {
  trips: Trip[];
  onDelete?: (id: string) => void;
  onEdit?: (trip: Trip) => void;
};

export default function TripList({ trips = [], onDelete, onEdit }: Props) {
  const { theme } = useTheme();

  const computed = useMemo(() => {
    return [...trips].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [trips]);

  if (trips.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: theme.textLight }}>No trips yet. Tap + to add.</Text>
      </View>
    );
  }

  const confirmDelete = (id: string) => {
    Alert.alert('Delete', 'Remove this trip?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(id) },
    ]);
  };

  return (
    <FlatList
      data={computed}
      keyExtractor={(t) => t.id}
      contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
      renderItem={({ item }) => (
        <View style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.date, { color: theme.textDark }]}>
              {new Date(item.startDate).toDateString()}
            </Text>
            <Text style={[styles.small, { color: theme.textLight }]}>
              Odo: {item.startOdometer} → {item.endOdometer ?? '—'} km
            </Text>
            <Text style={[styles.small, { color: theme.textLight }]}>
              Fuel: {item.fuelAdded} L — ₹{item.cost}
            </Text>
            <Text style={[styles.small, { color: theme.textLight }]}>
              {item.distance ? `Distance: ${item.distance} km` : 'Distance: —'} •{' '}
              {item.mileage ? `Mileage: ${item.mileage} km/L` : 'Mileage: —'}
            </Text>
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit?.(item)}>
            <Ionicons name="create-outline" size={20} color={theme.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => confirmDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color={theme.danger} />
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
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 1,
    alignItems: 'center',
  },
  date: { fontSize: 16, fontWeight: '600' },
  small: { fontSize: 13, marginTop: 4 },
  actionBtn: { marginLeft: 8, padding: 8 },
});
