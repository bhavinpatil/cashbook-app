// hooks/useInvestmentsStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

export type InvestmentType =
  | 'Stocks'
  | 'Mutual Funds'
  | 'Gold'
  | 'Bonds'
  | 'FD'
  | 'ETF'
  | 'Crypto'
  | 'Real Estate'
  | 'Other';

export type Investment = {
  id: string;
  date: string; // ISO string
  type: InvestmentType;
  description?: string;
  amount: number; // total amount invested (fallback)
  units?: number; // optional
  pricePerUnit?: number; // optional
  notes?: string;
  // computed values not persisted but provided by helpers
};

const STORAGE_KEY = 'investments_store';

export const useInvestmentsStore = () => {
  const loadAll = async (): Promise<Investment[]> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: Investment[] = raw ? JSON.parse(raw) : [];
      return parsed;
    } catch (e) {
      console.error('loadAll investments error', e);
      return [];
    }
  };

  const saveAll = async (list: Investment[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const add = async (inv: Omit<Investment, 'id'>) => {
    const list = await loadAll();
    const newItem: Investment = { id: Date.now().toString(), ...inv };
    list.push(newItem);
    await saveAll(list);
    return newItem;
  };

  const update = async (id: string, changes: Partial<Investment>) => {
    const list = await loadAll();
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Not found');
    list[idx] = { ...list[idx], ...changes };
    await saveAll(list);
    return list[idx];
  };

  const remove = async (id: string) => {
    const list = await loadAll();
    const updated = list.filter((i) => i.id !== id);
    await saveAll(updated);
    return updated;
  };

  const getByMonth = async (month: dayjs.Dayjs) => {
    const list = await loadAll();
    return list.filter((i) => dayjs(i.date).isSame(month, 'month'));
  };

  const getTotalsByType = async () => {
    const list = await loadAll();
    const totals: Record<string, number> = {};
    for (const i of list) {
      const value = computeValue(i);
      totals[i.type] = (totals[i.type] || 0) + value;
    }
    return totals;
  };

  const getMonthlyTrend = async (months = 6) => {
    const list = await loadAll();
    const now = dayjs();
    const labels: string[] = [];
    const values: number[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const m = now.subtract(i, 'month');
      labels.push(m.format('MMM'));
      const total = list
        .filter((tx) => dayjs(tx.date).isSame(m, 'month'))
        .reduce((sum, tx) => sum + computeValue(tx), 0);
      values.push(total);
    }
    return { labels, values };
  };

  const computeValue = (inv: Investment) => {
    if (inv.units != null && inv.pricePerUnit != null && inv.units > 0 && inv.pricePerUnit > 0) {
      return inv.units * inv.pricePerUnit;
    }
    return inv.amount || 0;
  };

  return {
    loadAll,
    add,
    update,
    remove,
    getByMonth,
    getTotalsByType,
    getMonthlyTrend,
    computeValue,
  };
};
