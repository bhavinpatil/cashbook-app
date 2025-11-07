import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FuelEntry = {
  id: string;
  date: string;
  odometer?: number; // optional
  amount: number;
  liters: number;
  distance?: number;
  mileage?: number;
  hasOdometer?: boolean;
};

export const useFuel = () => {
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);

  // Load entries on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem('fuelEntries');
        if (data) setFuelEntries(JSON.parse(data));
      } catch (err) {
        console.warn('Failed to load fuel entries:', err);
      }
    })();
  }, []);

  // Save helper
  const saveEntries = async (entries: FuelEntry[]) => {
    setFuelEntries(entries);
    await AsyncStorage.setItem('fuelEntries', JSON.stringify(entries));
  };

  // Add new fuel (without odometer yet)
  const addFuelEntry = async (entry: FuelEntry) => {
    const newEntry: FuelEntry = {
      ...entry,
      id: entry.id ?? String(Date.now()),
      odometer: undefined,
      hasOdometer: false,
      distance: undefined,
      mileage: undefined,
    };
    await saveEntries([...fuelEntries, newEntry]);
  };

  // Update odometer & compute mileage
  const updateOdometer = async (id: string, odometer: number) => {
    const list = [...fuelEntries];
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) return;

    const entry = list[index];
    entry.odometer = odometer;
    entry.hasOdometer = true;

    // Compute mileage for previous entry
    if (index > 0) {
      const prev = list[index - 1];
      if (
        typeof prev.odometer === 'number' &&
        typeof entry.odometer === 'number' &&
        entry.odometer > prev.odometer
      ) {
        prev.distance = entry.odometer - prev.odometer;
        prev.mileage = +(prev.distance / prev.liters).toFixed(2);
      }
    }

    await saveEntries(list);
  };

  // Edit existing entry (safe null checks)
  const editFuelEntry = async (updatedEntry: FuelEntry) => {
    const list = [...fuelEntries];
    const index = list.findIndex((e) => e.id === updatedEntry.id);
    if (index === -1) return;

    const oldEntry = list[index];
    const odometerChanged = updatedEntry.odometer !== oldEntry.odometer;

    if (
      odometerChanged &&
      index > 0 &&
      typeof updatedEntry.odometer === 'number'
    ) {
      const prev = list[index - 1];
      if (
        typeof prev.odometer === 'number' &&
        updatedEntry.odometer <= prev.odometer
      ) {
        throw new Error(
          `Odometer must be greater than previous record (${prev.odometer} km).`
        );
      }
    }

    // Update entry
    list[index] = { ...oldEntry, ...updatedEntry };

    // Recompute previous mileage
    if (index > 0) {
      const prev = list[index - 1];
      const curr = list[index];
      if (
        typeof prev.odometer === 'number' &&
        typeof curr.odometer === 'number'
      ) {
        prev.distance = curr.odometer - prev.odometer;
        prev.mileage = +(prev.distance / prev.liters).toFixed(2);
      }
    }

    // Recompute this entry only if not last
    if (index < list.length - 1) {
      const curr = list[index];
      const next = list[index + 1];
      if (
        typeof curr.odometer === 'number' &&
        typeof next.odometer === 'number'
      ) {
        curr.distance = next.odometer - curr.odometer;
        curr.mileage = +(curr.distance / curr.liters).toFixed(2);
      }
    } else {
      list[index].distance = undefined;
      list[index].mileage = undefined;
    }

    await saveEntries(list);
  };

  // Remove entry
  const removeFuelEntry = async (id: string) => {
    const list = fuelEntries.filter((e) => e.id !== id);

    for (let i = 1; i < list.length; i++) {
      const prev = list[i - 1];
      const curr = list[i];
      if (
        typeof prev.odometer === 'number' &&
        typeof curr.odometer === 'number'
      ) {
        prev.distance = curr.odometer - prev.odometer;
        prev.mileage = +(prev.distance / prev.liters).toFixed(2);
      }
    }

    // Last entry never has distance/mileage
    if (list.length > 0) {
      const last = list[list.length - 1];
      last.distance = undefined;
      last.mileage = undefined;
    }

    await saveEntries(list);
  };

  const updateEntries = async (entries: FuelEntry[]) => {
    await saveEntries(entries);
  };

  return {
    fuelEntries,
    addFuelEntry,
    editFuelEntry,
    removeFuelEntry,
    updateEntries,
    updateOdometer,
  };
};
