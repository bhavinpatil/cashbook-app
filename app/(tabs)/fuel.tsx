// app/(tabs)/fuel.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AddFuelModal, { FuelEntryInput } from '@/components/fuel/AddFuelModal';
import AddOdometerModal from '@/components/fuel/AddOdometerModal';
import FuelList from '@/components/fuel/FuelList';
import FuelSummary from '@/components/fuel/FuelSummary';
import { useFuel, FuelEntry } from '@/hooks/useFuel';
import { useTheme } from '@/contexts/ThemeContext';

export default function FuelScreen() {
  const { theme } = useTheme();
  const { fuelEntries, addFuelEntry, updateOdometer, removeFuelEntry } = useFuel();

  const [fuelModalVisible, setFuelModalVisible] = useState(false);
  const [odoModalVisible, setOdoModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FuelEntry | null>(null);

  const handleFuelSave = async (entry: FuelEntryInput) => {
    try {
      await addFuelEntry({ ...entry, id: entry.id ?? String(Date.now()) });
      setFuelModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add fuel entry.');
    }
  };

  const handleOdometerSave = async (value: number) => {
    if (selectedEntry) {
      await updateOdometer(selectedEntry.id, value);
      setOdoModalVisible(false);
      setSelectedEntry(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Fuel Log' }} />

      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { color: theme.textDark }]}>Fuel entries</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.tabActive }]}
          onPress={() => setFuelModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FuelSummary entries={fuelEntries} />

      <FuelList
        entries={fuelEntries}
        onDelete={async (id) => await removeFuelEntry(id)}
        onAddOdometer={(entry) => {
          setSelectedEntry(entry);
          setOdoModalVisible(true);
        }}
      />

      <AddFuelModal
        visible={fuelModalVisible}
        onClose={() => setFuelModalVisible(false)}
        onSave={handleFuelSave}
      />

      <AddOdometerModal
        visible={odoModalVisible}
        previousOdometer={
          selectedEntry
            ? fuelEntries[fuelEntries.indexOf(selectedEntry) - 1]?.odometer
            : undefined
        }
        onClose={() => setOdoModalVisible(false)}
        onSave={handleOdometerSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headerText: { fontSize: 20, fontWeight: '600' },
  addButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 8,
  },
});
