// app/insights/components/Header.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

export default function Header({
  currentMonth,
  setCurrentMonth,
}: {
  currentMonth: dayjs.Dayjs;
  setCurrentMonth: (m: dayjs.Dayjs) => void;
}) {
  const goToPrevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const goToNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconButton} onPress={goToPrevMonth}>
        <Ionicons name="chevron-back" size={28} color="#111" />
      </TouchableOpacity>

      <Text style={styles.monthLabel}>{currentMonth.format('MMMM YYYY')}</Text>

      <TouchableOpacity style={styles.iconButton} onPress={goToNextMonth}>
        <Ionicons name="chevron-forward" size={28} color="#111" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconButton: { padding: 8 },
  monthLabel: { fontSize: 20, fontWeight: '700', color: '#111' },
});
