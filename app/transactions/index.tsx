// app/transactions/index.tsx

import React, { useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TransactionSummary from './components/TransactionSummary';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import { useTransactions } from './hooks/useTransactions';
import TransactionFilterPanel from './components/TransactionFilterPanel';
import { Transaction } from './types';
import EditTransactionModal from './components/EditTransactionModal';
import ExportModal from './components/ExportModal';
import ScreenContainer from '@/components/ScreenContainer';
import CustomButton from '@/components/CustomButton';
import { useTheme } from '@/contexts/ThemeContext';

export default function TransactionsScreen() {
  const { bookId, bookName } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    loading,
    categories,
  } = useTransactions(bookId as string);

  const [modalVisible, setModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedType, setSelectedType] = useState<'credit' | 'debit'>('credit');

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

  const applyFilters = (options: any) => setFilters(options);
  const resetFilters = () => setFilters(null);

  const handleEdit = (tx: Transaction) => {
    setSelectedTx(tx);
    setEditModalVisible(true);
  };

  const getFilteredTransactions = () => {
    let data = [...transactions];
    if (filters) {
      const { type, startDate, endDate, minAmount, maxAmount, sortBy, categories } = filters;
      if (type && type !== 'all') data = data.filter((t) => t.type === type);
      if (startDate) data = data.filter((t) => new Date(t.date) >= startDate);
      if (endDate) data = data.filter((t) => new Date(t.date) <= endDate);
      if (minAmount != null) data = data.filter((t) => t.amount >= minAmount);
      if (maxAmount != null) data = data.filter((t) => t.amount <= maxAmount);
      if (categories?.length) data = data.filter((t) => categories.includes(t.category));
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
          data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } else {
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return data;
  };

  const filteredTransactions = getFilteredTransactions();

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <ScreenContainer hasFloatingButtons={false}>
      <TransactionSummary
        balance={balance}
        totalCredit={totalCredit}
        totalDebit={totalDebit}
        onViewInsights={() =>
          router.push({
            pathname: '/insights',
            params: { bookId, bookName },
          })
        }
      />

      <TransactionList
        transactions={filteredTransactions}
        onDelete={deleteTransaction}
        onEdit={handleEdit}
      />

      {/* Action Buttons (bottom row) */}
      <View style={styles.bottomActions}>
        <CustomButton
          title="💰 Cash In"
          onPress={() => {
            setSelectedType('credit');
            setModalVisible(true);
          }}
          style={[styles.actionButton, { backgroundColor: theme.success }]}
        />

        <CustomButton
          title="💸 Cash Out"
          onPress={() => {
            setSelectedType('debit');
            setModalVisible(true);
          }}
          style={[styles.actionButton, { backgroundColor: theme.danger }]}
        />

        <CustomButton
          title="⬇️ Export"
          onPress={() => setExportModalVisible(true)}
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
        />

        <CustomButton
          title="🔍 Filter"
          onPress={() => setFilterVisible(true)}
          style={[styles.actionButton, { backgroundColor: theme.primary }]} // ✅ uniform look
          textColor="#fff"
        />
      </View>


      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addTransaction}
        categories={categories}
        defaultType={selectedType}
      />

      {/* Edit Modal */}
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

      {/* Export Modal */}
      <ExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        transactions={filteredTransactions}
        bookName={bookName as string}
      />

      {/* Filter Modal */}
      <TransactionFilterPanel
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={applyFilters}
        onReset={resetFilters}
        initialFilters={filters}
        categories={categories}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 10,
  },
});
