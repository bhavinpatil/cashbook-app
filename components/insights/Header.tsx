// components/insights/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs, { Dayjs } from 'dayjs';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  currentMonth: Dayjs;
  setCurrentMonth: (m: Dayjs) => void;
}

export default function Header({ currentMonth, setCurrentMonth }: HeaderProps) {
  const { theme } = useTheme();

  const goToPrevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));

  const goToNextMonth = () => {
    const next = currentMonth.add(1, 'month');
    if (next.isAfter(dayjs(), 'month')) return;
    setCurrentMonth(next);
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconButton} onPress={goToPrevMonth}>
        <Ionicons name="chevron-back" size={28} color={theme.textDark} />
      </TouchableOpacity>

      <Text style={[styles.monthLabel, { color: theme.textDark }]}>
        {currentMonth.format('MMMM YYYY')}
      </Text>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={goToNextMonth}
        disabled={currentMonth.isSame(dayjs(), 'month')}
      >
        <Ionicons
          name="chevron-forward"
          size={28}
          color={currentMonth.isSame(dayjs(), 'month') ? theme.textLight : theme.textDark}
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
    marginBottom: 16,
  },
  iconButton: { padding: 8 },
  monthLabel: { fontSize: 20, fontWeight: '700' },
});
