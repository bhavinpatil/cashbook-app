// components/investments/InvestmentMonthHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useTheme } from '@/contexts/ThemeContext';

export default function InvestmentMonthHeader({
  currentMonth,
  setCurrentMonth,
}: {
  currentMonth: dayjs.Dayjs;
  setCurrentMonth: (m: dayjs.Dayjs) => void;
}) {
  const { theme } = useTheme();

  const goPrev = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const goNext = () => {
    const next = currentMonth.add(1, 'month');
    if (next.isAfter(dayjs(), 'month')) return;
    setCurrentMonth(next);
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={goPrev} style={styles.icon}>
        <Ionicons name="chevron-back" size={22} color={theme.textDark} />
      </TouchableOpacity>
      <Text style={[styles.label, { color: theme.textDark }]}>{currentMonth.format('MMMM YYYY')}</Text>
      <TouchableOpacity onPress={goNext} disabled={currentMonth.isSame(dayjs(), 'month')} style={styles.icon}>
        <Ionicons name="chevron-forward" size={22} color={currentMonth.isSame(dayjs(), 'month') ? theme.textLight : theme.textDark} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  icon: { padding: 8 },
  label: { fontSize: 16, fontWeight: '700', marginHorizontal: 8 },
});
