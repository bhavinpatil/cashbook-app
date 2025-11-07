// app/businesses/[businessId]/books.tsx

import React, { useState, useCallback } from 'react';
import {
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  View,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

  // Modal for adding book
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [bookName, setBookName] = useState('');


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
        <Text style={[styles.itemText, { fontWeight: 'bold', fontSize: 24, margin: 1 }]}>
          {item.name}
        </Text>
      </TouchableOpacity>

      {/* Edit/Delete buttons below the name */}
      <View style={[styles.actionsContainer, { marginTop: 20 }]}>
        <TouchableOpacity
          onPress={() => {
            setSelectedBook(item);
            setEditVisible(true);
          }}
        >
          <Text style={[styles.actionText, { fontSize: 20, marginLeft: 12 }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteBook(item.id)}>
          <Text
            style={[
              styles.actionText,
              { fontSize: 20, marginLeft: 12, color: COLORS.danger },
            ]}
          >
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleAddBook = async () => {
    if (!bookName.trim()) {
      Alert.alert('Error', 'Please enter a valid book name.');
      return;
    }

    try {
      const id = Math.random().toString(36).substring(2, 9);
      const newBook = { id, name: bookName.trim(), businessId };

      const data = await AsyncStorage.getItem('books');
      const books = data ? JSON.parse(data) : [];
      books.push(newBook);

      await AsyncStorage.setItem('books', JSON.stringify(books));
      setBookName('');
      setIsAddModalVisible(false);
      loadBooks();
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };



  return (
    <ScreenContainer scrollable={false}>
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
          onPress={() => setIsAddModalVisible(true)}
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
      {/* Add Book Modal */}
      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <Text style={GLOBAL_STYLES.title}>＋ Add New Book</Text>

            <TextInput
              style={styles.input}
              placeholder="Book Name"
              value={bookName}
              onChangeText={setBookName}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Button title="Cancel" onPress={() => setIsAddModalVisible(false)} />
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

  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // ← this spreads Edit (left) & Delete (right)
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 12, // optional: adds side spacing
  },

  actionText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
});
