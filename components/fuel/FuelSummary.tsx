import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FuelEntry } from '@/hooks/useFuel';

type Props = { entries: FuelEntry[] };

export default function FuelSummary({ entries }: Props) {
  const summary = useMemo(() => {
    let totalLiters = 0;
    let totalCost = 0;
    let totalDistance = 0;
    let validEntries = 0;

    entries.forEach((e) => {
      if (e.distance && e.mileage) {
        totalLiters += e.liters;
        totalCost += e.amount;
        totalDistance += e.distance;
        validEntries++;
      }
    });

    return {
      avgMileage: validEntries ? +(totalDistance / totalLiters).toFixed(2) : 0,
      totalLiters,
      totalCost,
      totalDistance,
    };
  }, [entries]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Summary</Text>
      <Text>Total Distance: {summary.totalDistance} km</Text>
      <Text>Total Fuel: {summary.totalLiters} L</Text>
      <Text>Total Cost: ₹{summary.totalCost}</Text>
      <Text>Average Mileage: {summary.avgMileage} km/L</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    elevation: 2,
  },
  title: { fontWeight: '600', marginBottom: 6, fontSize: 16 },
});
