// components/insights/Header.tsx
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

  const goToNextMonth = () => {
    const next = currentMonth.add(1, 'month');
    // Prevent navigating beyond current month
    if (next.isAfter(dayjs(), 'month')) return;
    setCurrentMonth(next);
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconButton} onPress={goToPrevMonth}>
        <Ionicons name="chevron-back" size={28} color="#111" />
      </TouchableOpacity>

      <Text style={styles.monthLabel}>{currentMonth.format('MMMM YYYY')}</Text>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={goToNextMonth}
        disabled={currentMonth.isSame(dayjs(), 'month')}
      >
        <Ionicons
          name="chevron-forward"
          size={28}
          color={currentMonth.isSame(dayjs(), 'month') ? '#aaa' : '#111'}
        />
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
