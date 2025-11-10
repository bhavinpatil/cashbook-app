// app/settings/index.tsx
import EditNameModal from '@/components/EditNameModal';
import ScrollableScreenContainer from '@/components/ScrollableScreenContainer';
import AddBookModal from '@/components/settings/AddBookModal';
import AddBusinessModal from '@/components/settings/AddBusinessModal';
import BookSection from '@/components/settings/BookSection';
import BusinessSection from '@/components/settings/BusinessSection';
import ThemeSelector from '@/components/settings/ThemeSelector';
import { useTheme } from '@/contexts/ThemeContext';
import { Book, Business } from '@/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Layout,
} from 'react-native-reanimated';
import ThemePickerModal from '@/components/settings/ThemePickerModal';
import { useRouter } from 'expo-router';
import { exportAllData, importAllData } from '@/utils/dataBackup';

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
  const [themePickerVisible, setThemePickerVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const router = useRouter();

  // Dropdown states
  const [businessOpen, setBusinessOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  // Chevron animations
  const businessRotation = useSharedValue(0);
  const bookRotation = useSharedValue(0);

  const businessChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${businessRotation.value}deg` }],
  }));

  const bookChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${bookRotation.value}deg` }],
  }));

  const toggleBusiness = () => {
    setBusinessOpen((prev) => {
      const newState = !prev;
      businessRotation.value = withTiming(newState ? 90 : 0, { duration: 200 });
      return newState;
    });
  };

  const toggleBook = () => {
    setBookOpen((prev) => {
      const newState = !prev;
      bookRotation.value = withTiming(newState ? 90 : 0, { duration: 200 });
      return newState;
    });
  };

  // Load data
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

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const deleteBusiness = (id: string) => {
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

  const deleteBook = (id: string) => {
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
      <Text style={[styles.header, { color: theme.textDark }]}>⚙️ Settings</Text>

      <TouchableOpacity
        style={[styles.rowItem, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => setExportModalVisible(true)}
      >
        <Ionicons name="cloud-upload-outline" size={22} color={theme.textLight} />
        <Text style={[styles.rowText, { color: theme.textDark }]}>Export / Import Data</Text>
      </TouchableOpacity>


      {/* Appearance (Compact Row) */}
      <TouchableOpacity
        style={[
          styles.rowItem,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
        onPress={() => setThemePickerVisible(true)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="color-palette-outline" size={22} color={theme.textLight} />
          <Text style={[styles.rowText, { color: theme.textDark }]}>Appearance</Text>
        </View>
        <Text style={{ color: theme.textLight, fontSize: 14 }}>
          {theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.rowItem, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => router.push('/investments' as any)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="bar-chart-outline" size={22} color={theme.textLight} />
          <Text style={[styles.rowText, { color: theme.textDark }]}>Investments</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.textLight} />
      </TouchableOpacity>

      {/* Theme Picker Modal */}
      <ThemePickerModal
        visible={themePickerVisible}
        onClose={() => setThemePickerVisible(false)}
      />

      {/* Businesses Section */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity style={styles.sectionHeader} onPress={toggleBusiness} activeOpacity={0.7}>
          <Ionicons name="business-outline" size={20} color={theme.textLight} />
          <Text style={[styles.sectionTitle, { color: theme.textLight }]}>Businesses</Text>
          <Animated.View style={[{ marginLeft: 'auto' }, businessChevronStyle]}>
            <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
          </Animated.View>
        </TouchableOpacity>

        {businessOpen && (
          <Animated.View layout={Layout.springify()}>
            <BusinessSection
              businesses={businesses}
              onAdd={() => setAddBusinessVisible(true)}
              onEdit={(id) => {
                setSelectedItem({ id, type: 'business' });
                setEditVisible(true);
              }}
              onDelete={deleteBusiness}
            />
          </Animated.View>
        )}
      </View>

      {/* Books Section */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity style={styles.sectionHeader} onPress={toggleBook} activeOpacity={0.7}>
          <Ionicons name="book-outline" size={20} color={theme.textLight} />
          <Text style={[styles.sectionTitle, { color: theme.textLight }]}>Books</Text>
          <Animated.View style={[{ marginLeft: 'auto' }, bookChevronStyle]}>
            <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
          </Animated.View>
        </TouchableOpacity>

        {bookOpen && (
          <Animated.View layout={Layout.springify()}>
            <BookSection
              books={books}
              onAdd={() => setAddBookVisible(true)}
              onEdit={(id) => {
                setSelectedItem({ id, type: 'book' });
                setEditVisible(true);
              }}
              onDelete={deleteBook}
            />
          </Animated.View>
        )}
      </View>

      {/* Modals */}
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

      <EditNameModal
        visible={editVisible}
        initialValue=""
        title="Edit Name"
        onSave={handleEditSave}
        onClose={() => setEditVisible(false)}
      />
      {/* Export / Import Modal */}
      {exportModalVisible && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.textDark }]}>
                Export / Import Data
              </Text>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={async () => {
                  setExportModalVisible(false);
                  await exportAllData();
                }}
              >
                <Text style={styles.modalButtonText}>📤 Export All Data</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.success }]}
                onPress={async () => {
                  setExportModalVisible(false);
                  await importAllData();
                }}
              >
                <Text style={styles.modalButtonText}>📥 Import Data</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setExportModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: theme.danger }]}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    </ScrollableScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600' },

  // 🧩 Add these two:
  rowItem: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    padding: 20,
    borderRadius: 16,
    elevation: 5,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

});
