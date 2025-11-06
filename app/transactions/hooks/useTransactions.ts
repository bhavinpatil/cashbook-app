// app/transactions/hooks/useTransactions.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';

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
    if (!loading && bookId)
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions, bookId, loading]);

  useEffect(() => {
    const uniqueCategories = Array.from(
      new Set(transactions.map((t) => t.category).filter((c): c is string => !!c))
    );
    setCategories(uniqueCategories);
  }, [transactions]);

  const addTransaction = (tx: Transaction) => setTransactions((prev) => [tx, ...prev]);
  const deleteTransaction = (id: string) =>
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  const updateTransaction = (updated: Transaction) =>
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

  return { transactions, addTransaction, deleteTransaction, updateTransaction, loading, categories };
};
