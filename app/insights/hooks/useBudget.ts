// app/insights/hooks/useBudget.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

export const useBudget = () => {
  const getBudgetKey = (bookId: string, month: dayjs.Dayjs) =>
    `budget_${bookId}_${month.format('YYYY_MM')}`;

  const loadBudget = async (bookId: string, month: dayjs.Dayjs): Promise<number | null> => {
    const key = getBudgetKey(bookId, month);
    const saved = await AsyncStorage.getItem(key);
    return saved ? Number(saved) : null;
  };

  const saveBudget = async (bookId: string, month: dayjs.Dayjs, value: number) => {
    const key = getBudgetKey(bookId, month);
    await AsyncStorage.setItem(key, String(value));
  };

  return { loadBudget, saveBudget };
};
