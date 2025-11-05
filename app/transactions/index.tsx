// app/transactions/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { randomUUID } from 'expo-crypto';
import ScreenContainer from '../../components/ScreenContainer';
import { GLOBAL_STYLES, COLORS } from '../../constants/theme';

interface Transaction {
  id: string;
  bookId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

interface Book {
  id: string;
  name: string;
  businessId: string;
}

export default function TransactionsScreen() {
  const { bookId } = useLocalSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Load book details + its transactions
  const loadTransactions = async () => {
    try {
      const txData = await AsyncStorage.getItem('transactions');
      const bookData = await AsyncStorage.getItem('books');

      const allTx: Transaction[] = txData ? JSON.parse(txData) : [];
      const allBooks: Book[] = bookData ? JSON.parse(bookData) : [];

      setBook(allBooks.find((b) => b.id === bookId) || null);
      setTransactions(allTx.filter((t) => t.bookId === bookId));
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [bookId])
  );

  const handleAddTransaction = async () => {
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid transaction amount.');
      return;
    }

    const newTx: Transaction = {
      id: randomUUID(),
      bookId: String(bookId),
      type,
      amount: Number(amount),
      description,
      date: new Date().toISOString(),
    };

    try {
      const data = await AsyncStorage.getItem('transactions');
      const allTx = data ? JSON.parse(data) : [];
      allTx.push(newTx);
      await AsyncStorage.setItem('transactions', JSON.stringify(allTx));
      setModalVisible(false);
      setAmount('');
      setDescription('');
      loadTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const data = await AsyncStorage.getItem('transactions');
          const allTx = data ? JSON.parse(data) : [];
          const updated = allTx.filter((t: Transaction) => t.id !== id);
          await AsyncStorage.setItem('transactions', JSON.stringify(updated));
          loadTransactions();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={[
        styles.transactionItem,
        item.type === 'credit'
          ? { borderLeftColor: COLORS.success }
          : { borderLeftColor: COLORS.danger },
      ]}
      onLongPress={() => deleteTransaction(item.id)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.txDesc}>{item.description || '(No description)'}</Text>
        <Text style={styles.txDate}>
          {new Date(item.date).toLocaleString()}
        </Text>
      </View>
      <Text
        style={[
          styles.txAmount,
          item.type === 'credit'
            ? { color: COLORS.success }
            : { color: COLORS.danger },
        ]}
      >
        {item.type === 'credit' ? '+' : '-'} ₹{item.amount}
      </Text>
    </TouchableOpacity>
  );

  const totalCredit = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalCredit - totalDebit;

  return (
    <ScreenContainer>
      <Text style={GLOBAL_STYLES.title}>
        {book ? book.name : 'Book'} - Transactions
      </Text>

      <View style={styles.summary}>
        <Text style={styles.credit}>Credit: ₹{totalCredit}</Text>
        <Text style={styles.debit}>Debit: ₹{totalDebit}</Text>
        <Text style={styles.balance}>
          Balance: ₹{balance} {balance >= 0 ? '🟢' : '🔴'}
        </Text>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 80 }}
      />

      {/* Floating Add Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>＋ Add Transaction</Text>
        </TouchableOpacity>
      </View>

      {/* Add Transaction Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <Text style={GLOBAL_STYLES.title}>Add Transaction</Text>

            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  type === 'credit' && styles.activeCredit,
                ]}
                onPress={() => setType('credit')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    type === 'credit' && styles.activeText,
                  ]}
                >
                  Credit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  type === 'debit' && styles.activeDebit,
                ]}
                onPress={() => setType('debit')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    type === 'debit' && styles.activeText,
                  ]}
                >
                  Debit
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Amount (₹)"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Description (optional)"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Save" onPress={handleAddTransaction} color={COLORS.primary} />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  transactionItem: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 5,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  txDesc: { fontSize: 16, color: COLORS.textDark },
  txDate: { fontSize: 12, color: COLORS.textLight },
  txAmount: { fontSize: 16, fontWeight: '600', marginLeft: 10 },
  summary: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  credit: { color: COLORS.success, fontSize: 14 },
  debit: { color: COLORS.danger, fontSize: 14 },
  balance: { color: COLORS.textDark, fontSize: 16, marginTop: 6 },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 5,
  },
  activeCredit: {
    backgroundColor: COLORS.success,
  },
  activeDebit: {
    backgroundColor: COLORS.danger,
  },
  toggleText: {
    color: COLORS.textDark,
    fontSize: 15,
  },
  activeText: {
    color: 'white',
    fontWeight: '600',
  },
});
