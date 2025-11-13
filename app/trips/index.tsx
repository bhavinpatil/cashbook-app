// app/trips/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import AddTripModal from '@/components/trips/AddTripModal';
import TripChart from '@/components/trips/TripChart';
import TripList from '@/components/trips/TripList';
import TripSummary from '@/components/trips/TripSummary';
import { useTheme } from '@/contexts/ThemeContext';
import { Trip, useTrips } from '@/hooks/useTrips';
import ScreenTitle from '@/components/ui/ScreenTitle';
import CustomButton from '@/components/CustomButton';

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
      Alert.alert('Error', err?.message || 'Failed to save trip entry.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Trips Log' }} />
      <View style={styles.headerRow}>
        <ScreenTitle>Trips</ScreenTitle>

        <View style={styles.headerButtons}>
          {/* Chart/List Toggle */}
          <TouchableOpacity
            style={[styles.roundBtn, { borderColor: theme.border }]}
            onPress={() => setShowChart(!showChart)}
          >
            <Ionicons
              name={showChart ? "list-outline" : "stats-chart-outline"}
              size={20}
              color={theme.textDark}
            />
          </TouchableOpacity>

          {/* Add Trip */}
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              setEditingTrip(null);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>


      {/* Summary */}
      <View style={{ paddingHorizontal: 12 }}>
        <TripSummary trips={trips} />
      </View>

      {/* Conditional view */}
      <View style={{ flex: 1 }}>
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
      </View>

      {/* Add / Edit Modal (central) */}
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    padding: 8,
    marginRight: 8,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },

  roundBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },

  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
});
