// app/(tabs)/books.tsx


import React, { useState, useCallback } from 'react';
import { Text, FlatList, TouchableOpacity, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import { GLOBAL_STYLES } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface Book {
  id: string;
  name: string;
  businessId: string;
}

interface Business {
  id: string;
  name: string;
}

export default function BooksScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [books, setBooks] = useState<(Book & { businessName: string })[]>([]);

  const loadBooks = async () => {
    try {
      const booksData = await AsyncStorage.getItem('books');
      const businessesData = await AsyncStorage.getItem('businesses');

      const allBooks: Book[] = booksData ? JSON.parse(booksData) : [];
      const allBusinesses: Business[] = businessesData ? JSON.parse(businessesData) : [];

      const combined = allBooks.map((book) => {
        const business = allBusinesses.find((b) => b.id === book.businessId);
        return {
          ...book,
          businessName: business ? business.name : 'Unknown Business',
        };
      });

      setBooks(combined);
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [])
  );

  const renderItem = ({ item }: { item: Book & { businessName: string } }) => (
    <TouchableOpacity
      style={[
        styles.item,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={() =>
        router.push({
          pathname: '/transactions',
          params: { bookId: item.id, bookName: item.name },
        })
      }
      activeOpacity={0.8}
    >
      <Text style={[styles.bookName, { color: theme.textDark }]}>{item.name}</Text>
      <Text style={[styles.businessName, { color: theme.textLight }]}>
        🏢 {item.businessName}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer hasFloatingButtons={false}>
      <Text style={[GLOBAL_STYLES.title, { color: theme.textDark }]}>Books</Text>
      <Text style={[GLOBAL_STYLES.subtitle, { color: theme.textLight }]}>
        Tap a book to view its transactions
      </Text>

      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[GLOBAL_STYLES.subtitle, { textAlign: 'center', color: theme.textLight }]}>
              No books found. You can add new ones from Settings.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    gap: 10,
    marginTop: 12,
    paddingBottom: 80,
  },
  item: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookName: {
    fontSize: 18,
    fontWeight: '700',
  },
  businessName: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyContainer: {
    marginTop: 24,
  },
});
