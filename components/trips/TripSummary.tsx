// components/trips/TripSummary.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trip } from '@/hooks/useTrips';
import { useTheme } from '@/contexts/ThemeContext';

type Props = { trips: Trip[] };

export default function TripSummary({ trips }: Props) {
  const { theme } = useTheme();

  const summary = useMemo(() => {
    let totalDistance = 0;
    let totalFuel = 0;
    let totalCost = 0;

    trips.forEach((t) => {
      if (t.distance) totalDistance += t.distance;
      if (t.fuelAdded) totalFuel += t.fuelAdded;
      if (t.cost) totalCost += t.cost;
    });

    const avgMileage = totalFuel > 0 ? +(totalDistance / totalFuel).toFixed(2) : 0;
    const costPerKm = totalDistance > 0 ? +(totalCost / totalDistance).toFixed(2) : 0;

    return { totalDistance, totalFuel, totalCost, avgMileage, costPerKm };
  }, [trips]);

  const metric = (label: string, value: string) => (
    <View style={styles.row}>
      <Text style={[styles.label, { color: theme.textLight }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.textDark }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {metric('Distance', `${summary.totalDistance} km`)}
      {metric('Fuel', `${summary.totalFuel.toFixed(2)} L`)}
      {metric('Cost', `₹${summary.totalCost.toFixed(2)}`)}
      {metric('Avg Mileage', `${summary.avgMileage} km/L`)}
      {metric('Cost / km', `₹${summary.costPerKm}`)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
    marginTop: 8,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: { fontSize: 13 },
  value: { fontSize: 15, fontWeight: '600' },
});
