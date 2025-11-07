// app/transactions/index.tsx
import React, { useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import TransactionSummary from './components/TransactionSummary';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import { useTransactions } from './hooks/useTransactions';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import TransactionFilterPanel from './components/TransactionFilterPanel';
import { Transaction } from './types';
import EditTransactionModal from './components/EditTransactionModal';
import ExportModal from './components/ExportModal';

export default function TransactionsScreen() {
  const { bookId } = useLocalSearchParams(); // 👈 get the bookId from route
  const { transactions, addTransaction, deleteTransaction, updateTransaction, loading, categories } = useTransactions(bookId as string);
  const [modalVisible, setModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

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

  const [selectedType, setSelectedType] = useState<'credit' | 'debit'>('credit');


  const handleEdit = (tx: Transaction) => {
    setSelectedTx(tx);
    setEditModalVisible(true);
  };

  const getFilteredTransactions = () => {
    let data = [...transactions]; // copy original list

    if (filters) {
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

      // Sorting options from filters
      switch (sortBy) {
        case 'oldest':
          data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          break;
        case 'highest':
          data.sort((a, b) => b.amount - a.amount);
          break;
        case 'lowest':
          data.sort((a, b) => a.amount - b.amount);
          break;
        default:
          // default: newest first
          data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } else {
      // ✅ Default sorting (newest first) when no filters applied
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
      {/* <CustomButton title="＋ Add Transaction" onPress={() => setModalVisible(true)} style={{ marginBottom: 40 }} /> */}
      {/* Floating Buttons Section */}
      <View
        style={{
          position: 'absolute',
          bottom: 30,
          left: 20,
          right: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Cash In & Cash Out Buttons */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 30 }}>
          {/* 💰 Cash In */}
          <TouchableOpacity
            onPress={() => {
              setSelectedType('credit');
              setModalVisible(true);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.success,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 30,
              elevation: 4,
            }}
          >
            <Ionicons name="arrow-down-circle" size={22} color="white" />
            <Text style={{ color: 'white', fontWeight: '600', marginLeft: 6 }}>Cash In</Text>
          </TouchableOpacity>

          {/* 💸 Cash Out */}
          <TouchableOpacity
            onPress={() => {
              setSelectedType('debit');
              setModalVisible(true);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.danger,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 30,
              elevation: 4,
            }}
          >
            <Ionicons name="arrow-up-circle" size={22} color="white" />
            <Text style={{ color: 'white', fontWeight: '600', marginLeft: 6 }}>Cash Out</Text>
          </TouchableOpacity>

          {/* Export Button */}
          <TouchableOpacity
            onPress={() => setExportModalVisible(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.secondary,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 30,
              elevation: 4,
            }}
          >
            <Ionicons name="download-outline" size={22} color="white" />
            <Text style={{ color: 'white', fontWeight: '600', marginLeft: 6 }}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Export Modal */}
        <ExportModal
          visible={exportModalVisible}
          onClose={() => setExportModalVisible(false)}
          transactions={filteredTransactions}
          bookName={bookId as string} // optionally replace with bookName if available
        />

        {/* 🧩 Filter FAB (bottom-right corner) */}
        <TouchableOpacity
          style={{
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
      </View>


      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addTransaction}
        categories={categories}
        defaultType={selectedType}
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
