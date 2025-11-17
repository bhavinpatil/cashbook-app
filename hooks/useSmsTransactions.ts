// hooks/useSmsTransactions.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { SmsTransaction } from '@/types/sms';
import { getMonthKey, autoDetectCategory } from '@/utils/smsUtils';

const round2 = (n: number) => Number(Number(n).toFixed(2));

export const useSmsTransactions = (monthKey?: string) => {
  const [transactions, setTransactions] = useState<SmsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const key = monthKey || getMonthKey();

  const sanitizeTx = (t: SmsTransaction): SmsTransaction => ({
    ...t,
    amount: round2(t.amount),     // clean floats
  });

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(`sms_transactions_${key}`);
      if (saved) {
        const parsed: SmsTransaction[] = JSON.parse(saved);

        // 🔥 sanitize all loaded values
        const cleaned = parsed.map(sanitizeTx);

        setTransactions(cleaned);

        // 🔥 also re-save cleaned version so future loads are correct
        await AsyncStorage.setItem(
          `sms_transactions_${key}`,
          JSON.stringify(cleaned)
        );

      } else {
        setTransactions([]);
      }
      setLoading(false);
    })();
  }, [key]);

  const saveToStorage = async (data: SmsTransaction[], targetKey = key) => {
    await AsyncStorage.setItem(`sms_transactions_${targetKey}`, JSON.stringify(data));
  };

  const addTransaction = async (tx: SmsTransaction, targetKey = key) => {
    const saved = await AsyncStorage.getItem(`sms_transactions_${targetKey}`);
    const current: SmsTransaction[] = saved ? JSON.parse(saved) : [];

    const duplicate = current.find(
      (t) => t.message === tx.message && t.amount === tx.amount && t.date === tx.date
    );
    if (duplicate) return;

    const detected = autoDetectCategory(tx.message);
    const updatedTx = detected
      ? { ...tx, amount: round2(tx.amount), category: detected, labeled: true }
      : { ...tx, amount: round2(tx.amount) };

    const updated = [updatedTx, ...current];
    await saveToStorage(updated, targetKey);

    if (targetKey === key) setTransactions(updated);
  };

  // New bulk add helper: accepts multiple parsed transactions and saves them deduplicated
  const addTransactions = async (txs: SmsTransaction[], targetKey = key) => {
    const saved = await AsyncStorage.getItem(`sms_transactions_${targetKey}`);
    const current: SmsTransaction[] = saved ? JSON.parse(saved) : [];

    // dedupe against existing (message+amount+date)
    const existingSet = new Set(current.map(t => `${t.message}||${t.amount}||${t.date}`));
    const toAdd: SmsTransaction[] = [];

    for (const tx of txs) {
      const amt = round2(tx.amount);
      const keyStr = `${tx.message}||${amt}||${tx.date}`;
      if (existingSet.has(keyStr)) continue;
      // auto-detect category if missing
      const detected = tx.category ?? autoDetectCategory(tx.message);
      const finalTx = {
        ...tx,
        amount: amt,
        category: detected,
        labeled: !!detected,
      };
      toAdd.push(finalTx);
      existingSet.add(keyStr);
    }

    if (toAdd.length === 0) return;

    const updated = [...toAdd, ...current];
    await saveToStorage(updated, targetKey);

    if (targetKey === key) setTransactions(updated);
  };

  const updateTransaction = async (updatedTx: SmsTransaction) => {
    const updated = transactions.map((t) =>
      t.id === updatedTx.id
        ? { ...updatedTx, amount: round2(updatedTx.amount) }
        : { ...t, amount: round2(t.amount) }   // ✅ also sanitize the untouched ones
    );
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
    const credit = round2(
      transactions
        .filter(t => t.type === 'Credit')
        .reduce((sum, t) => sum + round2(t.amount), 0)
    );

    const debit = round2(
      transactions
        .filter(t => t.type === 'Debit')
        .reduce((sum, t) => sum + round2(t.amount), 0)
    );

    return {
      credit,
      debit,
      balance: round2(credit - debit),
    };
  };

  return {
    transactions,
    addTransaction,
    addTransactions, // new bulk helper
    updateTransaction,
    deleteTransaction,
    updateCategory,
    getTotals,
    loading,
  };
};
