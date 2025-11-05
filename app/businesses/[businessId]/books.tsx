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

  const renderItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push(`/transactions?bookId=${item.id}`)}
      onLongPress={() => deleteBook(item.id)}
    >
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
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
          contentContainerStyle={{ gap: 10, paddingBottom: 80 }}
        />
      </View>

      {/* Floating Button Section */}
      <View style={styles.footer}>
        <Link href={`/books/add-book?businessId=${businessId}`} asChild>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>＋ Add New Book</Text>
          </TouchableOpacity>
        </Link>
      </View>
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
  },
  itemText: {
    fontSize: 16,
    color: COLORS.textDark,
  },
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
});
