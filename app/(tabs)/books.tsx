// app/(tabs)/books.tsx

import React, { useState, useCallback } from 'react';
import {
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  View,
  TextInput,
  Button,
  Alert,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import { GLOBAL_STYLES, COLORS } from '../../constants/theme';
import { randomUUID } from 'expo-crypto';
import CustomButton from '@/components/CustomButton';

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
  const [books, setBooks] = useState<(Book & { businessName: string })[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bookName, setBookName] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');

  // Load all books with their business names
  const loadBooks = async () => {
    try {
      const booksData = await AsyncStorage.getItem('books');
      const businessesData = await AsyncStorage.getItem('businesses');

      const allBooks: Book[] = booksData ? JSON.parse(booksData) : [];
      const allBusinesses: Business[] = businessesData
        ? JSON.parse(businessesData)
        : [];

      setBusinesses(allBusinesses);

      // Map business name for each book
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

  const handleAddBook = async () => {
    if (!bookName.trim()) {
      Alert.alert('Error', 'Please enter a valid book name.');
      return;
    }
    if (!selectedBusinessId) {
      Alert.alert('Error', 'Please select a business.');
      return;
    }

    try {
      const id = randomUUID();
      const newBook = { id, name: bookName, businessId: selectedBusinessId };

      const data = await AsyncStorage.getItem('books');
      const books = data ? JSON.parse(data) : [];
      books.push(newBook);

      await AsyncStorage.setItem('books', JSON.stringify(books));
      setBookName('');
      setSelectedBusinessId('');
      setIsModalVisible(false);
      loadBooks();
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  const renderItem = ({ item }: { item: Book & { businessName: string } }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push({
        pathname: `/transactions`,
        params: { bookId: item.id, bookName: item.name },
      })}
    >
      <Text style={styles.bookName}>{item.name}</Text>
      <Text style={styles.businessName}>🏢 {item.businessName}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <Text style={GLOBAL_STYLES.title}>All Books</Text>
      <Text style={GLOBAL_STYLES.subtitle}>
        Select a book to view transactions
      </Text>

      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 80 }}
      />

      {/* Floating Add Button */}
      {/* <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.addButtonText}>＋ Add New Book</Text>
        </TouchableOpacity>
      </View> */}
      <CustomButton title="＋ Add New Book" onPress={() => setIsModalVisible(true)} />

      {/* Add Book Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <Text style={GLOBAL_STYLES.title}>＋ Add New Book</Text>

            <TextInput
              style={styles.input}
              placeholder="Book Name"
              value={bookName}
              onChangeText={setBookName}
            />

            <Text style={{ marginBottom: 6 }}>Select Business:</Text>
            <Picker
              selectedValue={selectedBusinessId}
              style={styles.input}
              onValueChange={(value) => setSelectedBusinessId(value)}
            >
              <Picker.Item label="Select Business" value="" />
              {businesses.map((b) => (
                <Picker.Item key={b.id} label={b.name} value={b.id} />
              ))}
            </Picker>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
              <Button title="Save" onPress={handleAddBook} color={COLORS.primary} />
            </View>
          </View>
        </View>
      </Modal>
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
  bookName: {
    fontSize: 16,
    color: COLORS.textDark,
  },
  businessName: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
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
    marginVertical: 10,
    fontSize: 16,
  },
});
