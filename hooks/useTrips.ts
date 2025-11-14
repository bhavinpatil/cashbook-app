// hooks/useTrips.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Trip = {
  id: string;
  startDate: string;
  endDate?: string;
  startOdometer: number;
  endOdometer?: number;
  fuelAdded: number;
  cost: number;
  distance?: number;
  mileage?: number;
  notes?: string;
  images?: string[];
};

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);

  // Load trips
  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem('trips');
        if (data) setTrips(JSON.parse(data));
      } catch (err) {
        console.warn('Failed to load trips:', err);
      }
    })();
  }, []);

  // Save helper
  const saveTrips = async (entries: Trip[]) => {
    setTrips(entries);
    await AsyncStorage.setItem('trips', JSON.stringify(entries));
  };

  // ➕ Add Trip
  const addTrip = async (trip: Omit<Trip, 'id' | 'distance' | 'mileage'>) => {
    const newTrip: Trip = { ...trip, id: String(Date.now()) };

    // 🧮 Calculate mileage immediately if both odometers are known
    if (typeof newTrip.startOdometer === 'number' && typeof newTrip.endOdometer === 'number') {
      newTrip.distance = newTrip.endOdometer - newTrip.startOdometer;
      if (newTrip.distance > 0 && newTrip.fuelAdded > 0) {
        newTrip.mileage = +(newTrip.distance / newTrip.fuelAdded).toFixed(2);
      }
    }

    const updatedTrips = [...trips, newTrip];

    // Update previous trip (if applicable)
    if (updatedTrips.length > 1) {
      const prev = updatedTrips[updatedTrips.length - 2];
      const curr = updatedTrips[updatedTrips.length - 1];
      if (!prev.endOdometer && curr.startOdometer > prev.startOdometer) {
        prev.endOdometer = curr.startOdometer;
        prev.endDate = curr.startDate;
        prev.distance = curr.startOdometer - prev.startOdometer;
        prev.mileage = +(prev.distance / prev.fuelAdded).toFixed(2);
      }
    }

    await saveTrips(updatedTrips);
  };

  // 📝 Edit Trip
  const editTrip = async (updated: Trip) => {
    const list = [...trips];
    const index = list.findIndex((t) => t.id === updated.id);
    if (index === -1) return;

    // Recalculate mileage if possible
    if (
      typeof updated.startOdometer === 'number' &&
      typeof updated.endOdometer === 'number'
    ) {
      updated.distance = updated.endOdometer - updated.startOdometer;
      if (updated.distance > 0 && updated.fuelAdded > 0) {
        updated.mileage = +(updated.distance / updated.fuelAdded).toFixed(2);
      } else {
        updated.mileage = undefined;
      }
    } else {
      updated.distance = undefined;
      updated.mileage = undefined;
    }

    list[index] = updated;
    await saveTrips(list);
  };

  // ❌ Delete Trip
  const removeTrip = async (id: string) => {
    const filtered = trips.filter((t) => t.id !== id);
    await saveTrips(filtered);
  };

  return { trips, addTrip, editTrip, removeTrip };
};
