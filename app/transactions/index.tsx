// app/transactions/index.tsx
import React, { useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import TransactionSummary from './components/TransactionSummary';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import { useTransactions } from './hooks/useTransactions';
import CustomButton from '@/components/CustomButton';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import TransactionFilterPanel from './components/TransactionFilterPanel';
import { Transaction } from './types';
import EditTransactionModal from './components/EditTransactionModal';

export default function TransactionsScreen() {
  const { bookId } = useLocalSearchParams(); // 👈 get the bookId from route
  const { transactions, addTransaction, deleteTransaction, updateTransaction, loading, categories } = useTransactions(bookId as string);
  const [modalVisible, setModalVisible] = useState(false);

  if (!bookId) {
    return <Text style={{ marginTop: 50, textAlign: 'center' }}>No book selected.</Text>;
  }

  const totalCredit = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalCredit - totalDebit;

  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<any>(null);

  const applyFilters = (options: any) => setFilters(options);
  const resetFilters = () => setFilters(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const handleEdit = (tx: Transaction) => {
    setSelectedTx(tx);
    setEditModalVisible(true);
  };

  const getFilteredTransactions = () => {
    if (!filters) return transactions;
    let data = [...transactions];

    const { type, startDate, endDate, minAmount, maxAmount, sortBy, categories } = filters;

    // Type filter
    if (type && type !== 'all') {
      data = data.filter((t) => t.type === type);
    }

    // Date filter
    if (startDate) data = data.filter((t) => new Date(t.date) >= startDate);
    if (endDate) data = data.filter((t) => new Date(t.date) <= endDate);

    // Amount filter
    if (minAmount != null) data = data.filter((t) => t.amount >= minAmount);
    if (maxAmount != null) data = data.filter((t) => t.amount <= maxAmount);

    // Category filter
    if (categories?.length) data = data.filter((t) => categories.includes(t.category));

    // Sorting
    switch (sortBy) {
      case 'newest':
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest':
        data.sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        data.sort((a, b) => a.amount - b.amount);
        break;
    }

    return data;
  };

  const filteredTransactions = getFilteredTransactions();

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* ... TransactionSummary */}
      <TransactionSummary balance={balance} totalCredit={totalCredit} totalDebit={totalDebit} />

      <TransactionList transactions={filteredTransactions} onDelete={deleteTransaction} onEdit={handleEdit} />

      {/* Add Transaction Button */}
      <CustomButton title="＋ Add Transaction" onPress={() => setModalVisible(true)} style={{ marginBottom: 40 }} />

      {/* FAB Filter Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 100,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: COLORS.primary,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 6,
        }}
        onPress={() => setFilterVisible(true)}
      >
        <Ionicons name="filter" size={24} color="white" />
      </TouchableOpacity>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addTransaction}
        categories={categories}
      />

      {selectedTx && (
        <EditTransactionModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          transaction={selectedTx}
          onUpdate={(updatedTx) => {
            updateTransaction(updatedTx);
            setEditModalVisible(false);
          }}
          categories={categories}
        />
      )}


      {/* Filter Modal */}
      <TransactionFilterPanel
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={applyFilters}
        onReset={resetFilters}
        initialFilters={filters}
        categories={categories}
      />
    </View>
  );
}
