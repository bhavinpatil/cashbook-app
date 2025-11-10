// hooks/useSmsTransactions.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { SmsTransaction } from '@/types/sms';
import { getMonthKey, autoDetectCategory } from '@/utils/smsUtils';

export const useSmsTransactions = (monthKey?: string) => {
  const [transactions, setTransactions] = useState<SmsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const key = monthKey || getMonthKey();

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(`sms_transactions_${key}`);
      if (saved) setTransactions(JSON.parse(saved));
      setLoading(false);
    })();
  }, [key]);

  const saveToStorage = async (data: SmsTransaction[], targetKey = key) => {
    await AsyncStorage.setItem(`sms_transactions_${targetKey}`, JSON.stringify(data));
  };

  const addTransaction = async (tx: SmsTransaction, targetKey = key) => {
    // Load month-specific storage
    const saved = await AsyncStorage.getItem(`sms_transactions_${targetKey}`);
    const current: SmsTransaction[] = saved ? JSON.parse(saved) : [];

    // 🧠 Duplicate check: same message, date, and amount
    const duplicate = current.find(
      (t) => t.message === tx.message && t.amount === tx.amount && t.date === tx.date
    );
    if (duplicate) return;

    const detected = autoDetectCategory(tx.message);
    const updatedTx = detected ? { ...tx, category: detected, labeled: true } : tx;

    const updated = [updatedTx, ...current];
    await saveToStorage(updated, targetKey);

    // Update UI state if it's the same month currently open
    if (targetKey === key) setTransactions(updated);
  };

  const updateTransaction = async (updatedTx: SmsTransaction) => {
    const updated = transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t));
    setTransactions(updated);
    await saveToStorage(updated);
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    await saveToStorage(updated);
  };

  const updateCategory = async (id: string, category: string) => {
    const updated = transactions.map((t) =>
      t.id === id ? { ...t, category, labeled: true } : t
    );
    setTransactions(updated);
    await saveToStorage(updated);
  };

  const getTotals = () => {
    const credit = transactions.filter((t) => t.type === 'Credit').reduce((a, b) => a + b.amount, 0);
    const debit = transactions.filter((t) => t.type === 'Debit').reduce((a, b) => a + b.amount, 0);
    return { credit, debit, balance: credit - debit };
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateCategory,
    getTotals,
    loading,
  };
};
