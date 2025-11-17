// hooks/useTransactions.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Transaction } from '@/types/types';
import { eventBus } from '@/contexts/EventBus';

const round2 = (n: number) => Number(Number(n).toFixed(2));

export const useTransactions = (bookId: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const STORAGE_KEY = `transactions_${bookId}`;

  useEffect(() => {
    (async () => {
      if (!bookId) return;
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setTransactions(JSON.parse(saved));
      setLoading(false);
    })();
  }, [bookId]);

  useEffect(() => {
    if (!loading && bookId) {
      (async () => {
        const cleaned = transactions.map(t => ({
          ...t,
          amount: round2(t.amount),
        }));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        eventBus.emitUpdate('transactions'); // ✅ fire event after actual save
      })();
    }
  }, [transactions, bookId, loading]);

  useEffect(() => {
    const uniqueCategories = Array.from(
      new Set(transactions.map((t) => t.category).filter((c): c is string => !!c))
    );
    setCategories(uniqueCategories);
  }, [transactions]);

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [
      { ...tx, amount: round2(tx.amount) },
      ...prev,
    ]);
    eventBus.emitUpdate('transactions'); // ✅
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    eventBus.emitUpdate('transactions'); // ✅
  };

  const updateTransaction = (updated: Transaction) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === updated.id
          ? { ...updated, amount: round2(updated.amount) }
          : t
      )
    );
    eventBus.emitUpdate('transactions'); // ✅
  };

  return { transactions, addTransaction, deleteTransaction, updateTransaction, loading, categories };
};
