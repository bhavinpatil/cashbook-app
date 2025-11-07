// components/fuel/TripSummary.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trip } from '@/hooks/useTrips';

type Props = { trips: Trip[] };

export default function TripSummary({ trips }: Props) {
  const summary = useMemo(() => {
    let totalDistance = 0;
    let totalFuel = 0;
    let totalCost = 0;

    trips.forEach((t) => {
      if (t.distance && t.mileage) {
        totalDistance += t.distance;
        totalFuel += t.fuelAdded;
        totalCost += t.cost;
      }
    });

    const avgMileage = totalFuel > 0 ? +(totalDistance / totalFuel).toFixed(2) : 0;
    const costPerKm = totalDistance > 0 ? +(totalCost / totalDistance).toFixed(2) : 0;

    return { totalDistance, totalFuel, totalCost, avgMileage, costPerKm };
  }, [trips]);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Distance</Text>
        <Text style={styles.value}>{summary.totalDistance} km</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Fuel</Text>
        <Text style={styles.value}>{summary.totalFuel.toFixed(2)} L</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Cost</Text>
        <Text style={styles.value}>₹{summary.totalCost.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Avg Mileage</Text>
        <Text style={styles.value}>{summary.avgMileage} km/L</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Cost / km</Text>
        <Text style={styles.value}>₹{summary.costPerKm}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 10,
    padding: 12,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  label: { color: '#777', fontSize: 13 },
  value: { fontSize: 15, fontWeight: '600' },
});
