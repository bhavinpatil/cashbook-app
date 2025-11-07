// app/(tabs)/settings.tsx
import React, { useCallback, useState } from 'react';
import { View, Modal, TextInput, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import BusinessSection from '../components/settings/BusinessSection';
import BookSection from '../components/settings/BookSection';
import ThemeSelector from '../components/settings/ThemeSelector';
import EditNameModal from '../../components/EditNameModal';
import { useTheme } from '../../contexts/ThemeContext';
import { Business, Book } from '../types/types';
import AddBusinessModal from '../components/settings/AddBusinessModal';
import AddBookModal from '../components/settings/AddBookModal';
import ScrollableScreenContainer from '../../components/ScrollableScreenContainer';

type SelectedItem =
  | { id: string; type: 'business' }
  | { id: string; type: 'book' }
  | null;

export default function SettingsScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [addBusinessVisible, setAddBusinessVisible] = useState(false);
  const [addBookVisible, setAddBookVisible] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newBookName, setNewBookName] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const { theme } = useTheme();

  // ✅ Load businesses & books from AsyncStorage
  const loadData = async (): Promise<void> => {
    try {
      const bData = await AsyncStorage.getItem('businesses');
      const allBusinesses: Business[] = bData ? JSON.parse(bData) : [];

      const bkData = await AsyncStorage.getItem('books');
      const allBooksRaw: Book[] = bkData ? JSON.parse(bkData) : [];

      const combined: Book[] = allBooksRaw.map((book: Book) => {
        const business = allBusinesses.find((b) => b.id === book.businessId);
        return { ...book, businessName: business ? business.name : 'Unknown' };
      });

      setBusinesses(allBusinesses);
      setBooks(combined);
    } catch (e) {
      console.error('Error loading data', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // ✅ Delete Business
  const deleteBusiness = async (id: string) => {
    Alert.alert('Delete Business?', 'This will remove all its books as well.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedBusinesses = businesses.filter((b) => b.id !== id);
            const booksData = await AsyncStorage.getItem('books');
            const allBooks: Book[] = booksData ? JSON.parse(booksData) : [];
            const updatedBooks = allBooks.filter((b) => b.businessId !== id);

            await AsyncStorage.setItem('businesses', JSON.stringify(updatedBusinesses));
            await AsyncStorage.setItem('books', JSON.stringify(updatedBooks));
            loadData();
          } catch (err) {
            console.error('Error deleting business:', err);
          }
        },
      },
    ]);
  };

  // ✅ Delete Book
  const deleteBook = async (id: string) => {
    Alert.alert('Delete Book?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const data = await AsyncStorage.getItem('books');
          const allBooks: Book[] = data ? JSON.parse(data) : [];
          const updated = allBooks.filter((b) => b.id !== id);
          await AsyncStorage.setItem('books', JSON.stringify(updated));
          loadData();
        },
      },
    ]);
  };

  // ✅ Save Edited Name
  const handleEditSave = async (newName: string): Promise<void> => {
    if (!selectedItem || !newName.trim()) return;

    if (selectedItem.type === 'business') {
      const updated = businesses.map((b) =>
        b.id === selectedItem.id ? { ...b, name: newName.trim() } : b
      );
      await AsyncStorage.setItem('businesses', JSON.stringify(updated));
    } else {
      const data = await AsyncStorage.getItem('books');
      const allBooks: Book[] = data ? JSON.parse(data) : [];
      const updated = allBooks.map((b) =>
        b.id === selectedItem.id ? { ...b, name: newName.trim() } : b
      );
      await AsyncStorage.setItem('books', JSON.stringify(updated));
    }

    setEditVisible(false);
    loadData();
  };

  return (
    <ScrollableScreenContainer>
      {/* --- Businesses --- */}
      <BusinessSection
        businesses={businesses}
        onAdd={() => setAddBusinessVisible(true)}
        onEdit={(id) => {
          setSelectedItem({ id, type: 'business' });
          setEditVisible(true);
        }}
        onDelete={deleteBusiness}
      />

      {/* --- Books --- */}
      <BookSection
        books={books}
        onAdd={() => setAddBookVisible(true)}
        onEdit={(id) => {
          setSelectedItem({ id, type: 'book' });
          setEditVisible(true);
        }}
        onDelete={deleteBook}
      />

      {/* --- Add Business Modal --- */}
      <AddBusinessModal
        visible={addBusinessVisible}
        onClose={() => setAddBusinessVisible(false)}
        value={newBusinessName}
        setValue={setNewBusinessName}
        onSave={(name) => {
          if (!name.trim()) return Alert.alert('Enter business name');
          const newItem = { id: Date.now().toString(), name: name.trim() };
          AsyncStorage.setItem('businesses', JSON.stringify([...businesses, newItem]));
          setAddBusinessVisible(false);
          setNewBusinessName('');
          loadData();
        }}
      />

      {/* --- Add Book Modal --- */}
      <AddBookModal
        visible={addBookVisible}
        onClose={() => setAddBookVisible(false)}
        value={newBookName}
        setValue={setNewBookName}
        selectedBusiness={selectedBusinessId}
        setSelectedBusiness={setSelectedBusinessId}
        businesses={businesses}
        onSave={(bookName, businessId) => {
          if (!bookName.trim()) return Alert.alert('Enter book name');
          if (!businessId) return Alert.alert('Select a business');
          const id = Math.random().toString(36).slice(2, 9);
          const newBook = { id, name: bookName.trim(), businessId };
          AsyncStorage.getItem('books').then((data) => {
            const existing = data ? JSON.parse(data) : [];
            existing.push(newBook);
            AsyncStorage.setItem('books', JSON.stringify(existing));
            setAddBookVisible(false);
            setNewBookName('');
            setSelectedBusinessId('');
            loadData();
          });
        }}
      />

      {/* --- Theme Selector --- */}
      <ThemeSelector />

      {/* --- Edit Modal --- */}
      <EditNameModal
        visible={editVisible}
        initialValue=""
        title="Edit Name"
        onSave={handleEditSave}
        onClose={() => setEditVisible(false)}
      />
    </ScrollableScreenContainer>
  );
}
