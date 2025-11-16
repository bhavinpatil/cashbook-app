// hooks/useBudget.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useBudget = () => {
  const GLOBAL_KEY = 'global_budget';

  const saveBudget = async (budget: number) => {
    try {
      await AsyncStorage.setItem(GLOBAL_KEY, JSON.stringify(budget));
    } catch (e) {
      console.error('Error saving global budget:', e);
    }
  };

  const loadBudget = async (): Promise<number> => {
    try {
      const val = await AsyncStorage.getItem(GLOBAL_KEY);
      return val ? JSON.parse(val) : 0;
    } catch (e) {
      console.error('Error loading global budget:', e);
      return 0;
    }
  };

  const clearBudget = async () => {
    try {
      await AsyncStorage.removeItem(GLOBAL_KEY);
    } catch (e) {
      console.error('Error clearing global budget:', e);
    }
  };

  return { saveBudget, loadBudget, clearBudget };
};
