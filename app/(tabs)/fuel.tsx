// app/(tabs)/fuel.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import TripSummary from '@/components/trips/TripSummary';
import TripList from '@/components/trips/TripList';
import TripChart from '@/components/trips/TripChart';
import AddTripModal from '@/components/trips/AddTripModal';
import { useTrips, Trip } from '@/hooks/useTrips';
import { useTheme } from '@/contexts/ThemeContext';

export default function TripScreen() {
  const { theme } = useTheme();
  const { trips, addTrip, editTrip, removeTrip } = useTrips();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showChart, setShowChart] = useState(false);

  const handleSave = async (tripData: Omit<Trip, 'id' | 'distance' | 'mileage'>) => {
    try {
      if (editingTrip) {
        await editTrip({ ...editingTrip, ...tripData });
        setEditingTrip(null);
      } else {
        await addTrip(tripData);
      }
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save trip entry.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Trips Log' }} />

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { color: theme.textDark }]}>Trips</Text>
        <View style={{ flexDirection: 'row' }}>
          {/* Insights Button */}
          <TouchableOpacity
            style={[styles.iconButton]}
            onPress={() => setShowChart(!showChart)}
          >
            <Ionicons name={showChart ? 'list-outline' : 'stats-chart-outline'} size={22} color={theme.textDark} />
          </TouchableOpacity>

          {/* Add Trip Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.tabActive }]}
            onPress={() => {
              setEditingTrip(null);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary */}
      {!showChart && <TripSummary trips={trips} />}

      {/* Conditional View */}
      {showChart ? (
        <TripChart trips={trips} />
      ) : (
        <TripList
          trips={trips}
          onEdit={(trip) => {
            setEditingTrip(trip);
            setModalVisible(true);
          }}
          onDelete={async (id) => {
            await removeTrip(id);
          }}
        />
      )}

      {/* Add/Edit Trip Modal */}
      <AddTripModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingTrip(null);
        }}
        onSave={handleSave}
        initial={editingTrip || undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerText: { fontSize: 20, fontWeight: '600' },
  iconButton: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
  },
});
