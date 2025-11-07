// app/(tabs)/settings.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import CustomButton from '../../components/CustomButton';
import EditNameModal from '../../components/EditNameModal';
import { GLOBAL_STYLES, COLORS } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface Business {
  id: string;
  name: string;
}
interface Book {
  id: string;
  name: string;
  businessId: string;
}

export default function SettingsScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [books, setBooks] = useState<(Book & { businessName: string })[]>([]);

  // Modals
  const [editVisible, setEditVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: 'business' | 'book' } | null>(null);
  const [addBusinessVisible, setAddBusinessVisible] = useState(false);
  const [addBookVisible, setAddBookVisible] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newBookName, setNewBookName] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const { theme, setThemeByName } = useTheme();

  // Reload all data
  const loadData = async () => {
    try {
      const bData = await AsyncStorage.getItem('businesses');
      const allBusinesses: Business[] = bData ? JSON.parse(bData) : [];
      setBusinesses(allBusinesses);

      const bkData = await AsyncStorage.getItem('books');
      const allBooks: Book[] = bkData ? JSON.parse(bkData) : [];

      const combined = allBooks.map((book) => {
        const business = allBusinesses.find((b) => b.id === book.businessId);
        return { ...book, businessName: business ? business.name : 'Unknown' };
      });
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

  // --- Business Handlers ---
  const addBusiness = async () => {
    if (!newBusinessName.trim()) return Alert.alert('Enter business name');
    const newItem = { id: Date.now().toString(), name: newBusinessName.trim() };
    const updated = [...businesses, newItem];
    await AsyncStorage.setItem('businesses', JSON.stringify(updated));
    setAddBusinessVisible(false);
    setNewBusinessName('');
    loadData();
  };

  const deleteBusiness = async (id: string) => {
    Alert.alert('Delete Business?', 'This will remove all its books as well.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedBusinesses = businesses.filter((b) => b.id !== id);
          const booksData = await AsyncStorage.getItem('books');
          const books = booksData ? JSON.parse(booksData) : [];
          const updatedBooks = books.filter((b: Book) => b.businessId !== id);

          await AsyncStorage.setItem('businesses', JSON.stringify(updatedBusinesses));
          await AsyncStorage.setItem('books', JSON.stringify(updatedBooks));
          loadData();
        },
      },
    ]);
  };

  // --- Book Handlers ---
  const addBook = async () => {
    if (!newBookName.trim()) return Alert.alert('Enter book name');
    if (!selectedBusinessId) return Alert.alert('Select a business');
    const id = Math.random().toString(36).slice(2, 9);
    const newBook = { id, name: newBookName.trim(), businessId: selectedBusinessId };

    const booksData = await AsyncStorage.getItem('books');
    const existing = booksData ? JSON.parse(booksData) : [];
    existing.push(newBook);
    await AsyncStorage.setItem('books', JSON.stringify(existing));
    setAddBookVisible(false);
    setNewBookName('');
    setSelectedBusinessId('');
    loadData();
  };

  const deleteBook = async (id: string) => {
    Alert.alert('Delete Book?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const data = await AsyncStorage.getItem('books');
          const books = data ? JSON.parse(data) : [];
          const updated = books.filter((b: Book) => b.id !== id);
          await AsyncStorage.setItem('books', JSON.stringify(updated));
          loadData();
        },
      },
    ]);
  };

  const handleEditSave = async (newName: string) => {
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
    loadData();
  };

  // --- UI render helpers ---
  const renderBusiness = ({ item }: { item: Business }) => (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{item.name}</Text>
      <View style={styles.actions}>
        <CustomButton
          title="Edit"
          type="outline"
          style={styles.smallBtn}
          onPress={() => {
            setSelectedItem({ id: item.id, type: 'business' });
            setEditVisible(true);
          }}
        />
        <CustomButton
          title="Delete"
          type="secondary"
          style={styles.smallBtn}
          onPress={() => deleteBusiness(item.id)}
        />
      </View>
    </View>
  );

  const renderBook = ({ item }: { item: Book & { businessName: string } }) => (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{item.name}</Text>
      <Text style={styles.itemSub}>🏢 {item.businessName}</Text>
      <View style={styles.actions}>
        <CustomButton
          title="Edit"
          type="outline"
          style={styles.smallBtn}
          onPress={() => {
            setSelectedItem({ id: item.id, type: 'book' });
            setEditVisible(true);
          }}
        />
        <CustomButton
          title="Delete"
          type="secondary"
          style={styles.smallBtn}
          onPress={() => deleteBook(item.id)}
        />
      </View>
    </View>
  );

  return (
     <ScreenContainer scrollable={false}>

      {/* Businesses Section */}
      <Text style={styles.sectionTitle}>Businesses</Text>
      <FlatList
        data={businesses}
        renderItem={renderBusiness}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No businesses yet</Text>}
      />
      <CustomButton title="＋ Add Business" onPress={() => setAddBusinessVisible(true)} />

      {/* Books Section */}
      <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Books</Text>
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No books yet</Text>}
      />
      <CustomButton title="＋ Add Book" onPress={() => setAddBookVisible(true)} />

      {/* Edit Modal */}
      <EditNameModal
        visible={editVisible}
        initialValue=""
        title="Edit Name"
        onSave={handleEditSave}
        onClose={() => setEditVisible(false)}
      />

      {/* Add Business Modal */}
      <Modal visible={addBusinessVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={GLOBAL_STYLES.title}>Add New Business</Text>
            <TextInput
              style={styles.input}
              placeholder="Business Name"
              value={newBusinessName}
              onChangeText={setNewBusinessName}
            />
            <View style={styles.modalButtons}>
              <CustomButton title="Cancel" type="secondary" onPress={() => setAddBusinessVisible(false)} />
              <CustomButton title="Save" onPress={addBusiness} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Book Modal */}
      <Modal visible={addBookVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={GLOBAL_STYLES.title}>Add New Book</Text>
            <TextInput
              style={styles.input}
              placeholder="Book Name"
              value={newBookName}
              onChangeText={setNewBookName}
            />
            <Text style={{ marginBottom: 6 }}>Select Business:</Text>
            <Picker
              selectedValue={selectedBusinessId}
              style={styles.input}
              onValueChange={(val) => setSelectedBusinessId(val)}
            >
              <Picker.Item label="Select Business" value="" />
              {businesses.map((b) => (
                <Picker.Item key={b.id} label={b.name} value={b.id} />
              ))}
            </Picker>
            <View style={styles.modalButtons}>
              <CustomButton title="Cancel" type="secondary" onPress={() => setAddBookVisible(false)} />
              <CustomButton title="Save" onPress={addBook} />
            </View>
          </View>
        </View>
      </Modal>
      {/* Theme Switcher Section */}
      <View style={{ marginTop: 40 }}>
        <Text style={[GLOBAL_STYLES.title, { color: theme.textDark }]}>App Theme</Text>
        <Picker
          selectedValue={theme.name}
          onValueChange={(value) => setThemeByName(value as 'light' | 'dark' | 'blue' | 'green')}
          style={{
            backgroundColor: theme.card,
            color: theme.textDark,
            marginTop: 10,
            borderRadius: 10,
          }}
        >
          <Picker.Item label="Light" value="light" />
          <Picker.Item label="Dark" value="dark" />
          <Picker.Item label="Blue" value="blue" />
          <Picker.Item label="Green" value="green" />
        </Picker>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 10,
    marginBottom: 8,
  },
  list: { gap: 10, marginBottom: 20 },
  item: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  itemSub: { fontSize: 13, color: COLORS.textLight, marginBottom: 6 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  smallBtn: { flex: 1, paddingVertical: 8 },
  empty: { textAlign: 'center', color: COLORS.textLight, fontStyle: 'italic', marginVertical: 10 },
  modalOverlay: {
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
    elevation: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
  },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
});
