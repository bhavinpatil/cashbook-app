// app/(tabs)/books.tsx
import ScreenContainer from '@/components/ScreenContainer';
import { useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Book {
  id: string;
  name: string;
  businessId: string;
  businessName?: string;
}

interface Business {
  id: string;
  name: string;
}

export default function BooksScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // ✅ simple mount flag

  const loadBooks = async () => {
    try {
      const booksData = await AsyncStorage.getItem('books');
      const businessesData = await AsyncStorage.getItem('businesses');
      const allBooks: Book[] = booksData ? JSON.parse(booksData) : [];
      const allBusinesses: Business[] = businessesData ? JSON.parse(businessesData) : [];

      const combined = allBooks.map((book) => {
        const business = allBusinesses.find((b) => b.id === book.businessId);
        return { ...book, businessName: business ? business.name : 'Unknown' };
      });

      setBooks(combined);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setIsLoaded(true); // ✅ render only after one load attempt
    }
  };

  useFocusEffect(useCallback(() => { loadBooks(); }, []));

  const renderItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={[
        styles.item,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: '/transactions',
          params: { bookId: item.id, bookName: item.name },
        })
      }
    >
      <Text style={[styles.bookName, { color: theme.textDark }]}>{item.name}</Text>
      <Text style={[styles.businessName, { color: theme.textLight }]}>
        🏢 {item.businessName}
      </Text>
    </TouchableOpacity>
  );

  // ✅ Render nothing until first load completes
  if (!isLoaded) return null;

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: theme.textDark }]}>Books</Text>

      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 50, color: theme.textLight }}>📚</Text>
            <Text style={[styles.emptyText, { color: theme.textLight }]}>
              No books yet. Add a new one from Settings.
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
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
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
});
