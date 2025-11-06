// app/businesses/[businessId]/books.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  View,
} from 'react-native';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../../components/ScreenContainer';
import { GLOBAL_STYLES, COLORS } from '../../../constants/theme';
import CustomButton from '@/components/CustomButton'; // ✅ import your custom button
import EditNameModal from '@/components/EditNameModal';

interface Book {
  id: string;
  name: string;
  businessId: string;
}

interface Business {
  id: string;
  name: string;
}

export default function BusinessBooksScreen() {
  const router = useRouter();
  const { businessId } = useLocalSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);

  // Modal states
  const [editVisible, setEditVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const loadBooks = async () => {
    try {
      const booksData = await AsyncStorage.getItem('books');
      const businessesData = await AsyncStorage.getItem('businesses');
      const allBooks: Book[] = booksData ? JSON.parse(booksData) : [];
      const allBusinesses: Business[] = businessesData
        ? JSON.parse(businessesData)
        : [];

      const filtered = allBooks.filter((b) => b.businessId === businessId);
      const current = allBusinesses.find((b) => b.id === businessId);

      setBooks(filtered);
      setBusiness(current || null);
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [businessId])
  );

  const deleteBook = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this book?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const data = await AsyncStorage.getItem('books');
          const books = data ? JSON.parse(data) : [];
          const updated = books.filter((b: Book) => b.id !== id);
          await AsyncStorage.setItem('books', JSON.stringify(updated));
          loadBooks();
        },
      },
    ]);
  };

  const handleEditSave = async (newName: string) => {
    if (!selectedBook || !newName.trim()) return;

    const data = await AsyncStorage.getItem('books');
    const books = data ? JSON.parse(data) : [];

    const updated = books.map((b: Book) =>
      b.id === selectedBook.id ? { ...b, name: newName.trim() } : b
    );

    await AsyncStorage.setItem('books', JSON.stringify(updated));
    setBooks(updated.filter((b: any) => b.businessId === businessId));
  };

  const renderItem = ({ item }: { item: Book }) => (
    <View style={styles.item}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => router.push(`/transactions?bookId=${item.id}`)}
        activeOpacity={0.8}
      >
        <Text style={styles.itemText}>{item.name}</Text>
      </TouchableOpacity>

      {/* Edit/Delete buttons below the name */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={() => {
            setSelectedBook(item);
            setEditVisible(true);
          }}
        >
          <Text style={styles.editButton}>✏️ Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteBook(item.id)}>
          <Text style={styles.deleteButton}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <Text style={GLOBAL_STYLES.title}>
          {business ? business.name : 'Business'} - Books
        </Text>

        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: COLORS.textLight, marginTop: 30 }}>
              No books yet.
            </Text>
          }
        />
      </View>

      {/* ✅ Floating Add Book Button using CustomButton */}
      <View style={styles.footer}>
        <CustomButton
          title="＋ Add New Book"
          onPress={() => router.push(`/books/add-book?businessId=${businessId}`)}
          style={{ marginBottom: 40 }}
        />
      </View>


      {/* Edit Name Modal */}
      <EditNameModal
        visible={editVisible}
        initialValue={selectedBook?.name || ''}
        title="Edit Book Name"
        onSave={handleEditSave}
        onClose={() => setEditVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 14,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 6,
  },
  itemText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
    marginTop: 4,
  },
  editButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  deleteButton: {
    fontSize: 16,
    color: COLORS.danger,
    fontWeight: '500',
  },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});
