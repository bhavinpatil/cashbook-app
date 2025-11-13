// app/settings/index.tsx
import EditNameModal from '@/components/EditNameModal';
import ScrollableScreenContainer from '@/components/ScrollableScreenContainer';
import AddBookModal from '@/components/settings/AddBookModal';
import AddBusinessModal from '@/components/settings/AddBusinessModal';
import BookSection from '@/components/settings/BookSection';
import BusinessSection from '@/components/settings/BusinessSection';
import ThemePickerModal from '@/components/settings/ThemePickerModal';
import { useTheme } from '@/contexts/ThemeContext';
import { Book, Business } from '@/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { exportAllData, importAllData } from '@/utils/dataBackup';
import ListDialogModal from '@/components/settings/ListDialogModal';
import SimpleListModal from '@/components/settings/SimpleListModal';
import ScreenTitle from '@/components/ui/ScreenTitle';

interface GridItemProps {
  title: string;
  icon: string;
  onPress: () => void;
}

// Grid Item Component
const SettingsGridItem: React.FC<GridItemProps> = ({ title, icon, onPress }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.gridItem,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon as any} size={26} color={theme.primary} />
      <Text style={[styles.gridText, { color: theme.textDark }]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [editVisible, setEditVisible] = useState(false);
  type SelectedItem =
    | { id: string; type: 'business' }
    | { id: string; type: 'book' }
    | null;

  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [addBookVisible, setAddBookVisible] = useState(false);
  const [addBusinessVisible, setAddBusinessVisible] = useState(false);
  const [themePickerVisible, setThemePickerVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const [booksModalOpen, setBooksModalOpen] = useState(false);
  const [businessModalOpen, setBusinessModalOpen] = useState(false);

  const [newBookName, setNewBookName] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [newBusinessName, setNewBusinessName] = useState('');

  const { theme } = useTheme();
  const router = useRouter();

  // Load Books + Businesses
  const loadData = async () => {
    const bData = await AsyncStorage.getItem('businesses');
    const biz: Business[] = bData ? JSON.parse(bData) : [];

    const bkData = await AsyncStorage.getItem('books');
    const bks: Book[] = bkData ? JSON.parse(bkData) : [];

    const merged = bks.map((bk) => ({
      ...bk,
      businessName: biz.find((b) => b.id === bk.businessId)?.name ?? 'Unknown',
    }));

    setBusinesses(biz);
    setBooks(merged);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  // Delete Functions
  const deleteBusiness = async (id: string) => {
    Alert.alert('Delete Business?', 'This will remove all its books.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedBiz = businesses.filter((b) => b.id !== id);
          const allBooks: Book[] = JSON.parse(await AsyncStorage.getItem('books') || '[]');
          const updatedBooks = allBooks.filter((bk) => bk.businessId !== id);

          await AsyncStorage.setItem('businesses', JSON.stringify(updatedBiz));
          await AsyncStorage.setItem('books', JSON.stringify(updatedBooks));
          loadData();
        },
      },
    ]);
  };

  const deleteBook = async (id: string) => {
    Alert.alert('Delete Book?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const allBooks: Book[] = JSON.parse(await AsyncStorage.getItem('books') || '[]');
          const updated = allBooks.filter((b) => b.id !== id);

          await AsyncStorage.setItem('books', JSON.stringify(updated));
          loadData();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, padding: 16 }}>
      <ScreenTitle>Tools & Features</ScreenTitle>

      {/* Remove Big Header */}

      {/* 🔹 GRID LAYOUT */}
      <View style={styles.gridWrapper}>
        <SettingsGridItem
          title="Backup & Restore"
          icon="cloud-upload-outline"
          onPress={() => setExportModalVisible(true)}
        />

        <SettingsGridItem
          title="SMS Transactions"
          icon="mail-outline"
          onPress={() => router.push('/sms')}
        />

        <SettingsGridItem
          title="Appearance"
          icon="color-palette-outline"
          onPress={() => setThemePickerVisible(true)}
        />

        <SettingsGridItem
          title="Portfolio"
          icon="bar-chart-outline"
          onPress={() => router.push('/investments')}
        />

        <SettingsGridItem
          title="Books"
          icon="book-outline"
          onPress={() => setBooksModalOpen(true)}
        />

        <SettingsGridItem
          title="Businesses"
          icon="business-outline"
          onPress={() => setBusinessModalOpen(true)}
        />
      </View>

      {/* ----------------------- BOOKS MODAL ----------------------- */}
      <SimpleListModal
        visible={booksModalOpen}
        title="Books"
        onClose={() => setBooksModalOpen(false)}
      >
        <BookSection
          books={books}
          onAdd={() => setAddBookVisible(true)}
          onEdit={(id) => { setSelectedItem({ id, type: "book" }); setEditVisible(true); }}
          onDelete={deleteBook}
        />
      </SimpleListModal>

      <SimpleListModal
        visible={businessModalOpen}
        title="Businesses"
        onClose={() => setBusinessModalOpen(false)}
      >
        <BusinessSection
          businesses={businesses}
          onAdd={() => setAddBusinessVisible(true)}
          onEdit={(id) => { setSelectedItem({ id, type: "business" }); setEditVisible(true); }}
          onDelete={deleteBusiness}
        />
      </SimpleListModal>



      {/* ----------------------- THEME PICKER ----------------------- */}
      <ThemePickerModal
        visible={themePickerVisible}
        onClose={() => setThemePickerVisible(false)}
      />

      {/* ----------------------- ADD BOOK ----------------------- */}
      <AddBookModal
        visible={addBookVisible}
        onClose={() => setAddBookVisible(false)}
        value={newBookName}
        setValue={setNewBookName}
        selectedBusiness={selectedBusinessId}
        setSelectedBusiness={setSelectedBusinessId}
        businesses={businesses}
        onSave={(bookName, businessId) => {
          if (!bookName || !businessId) return Alert.alert("Missing fields");

          const id = Date.now().toString();
          const newBook = { id, name: bookName, businessId };

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

      {/* ----------------------- ADD BUSINESS ----------------------- */}
      <AddBusinessModal
        visible={addBusinessVisible}
        onClose={() => setAddBusinessVisible(false)}
        value={newBusinessName}
        setValue={setNewBusinessName}
        onSave={(name) => {
          if (!name) return Alert.alert("Missing name");

          const newBiz = { id: Date.now().toString(), name };
          AsyncStorage.setItem('businesses', JSON.stringify([...businesses, newBiz]));
          setAddBusinessVisible(false);
          setNewBusinessName('');
          loadData();
        }}
      />

      {/* ----------------------- EDIT NAME ----------------------- */}
      <EditNameModal
        visible={editVisible}
        initialValue=""
        title="Edit Name"
        onSave={async (newName) => {
          if (!selectedItem) return;

          if (selectedItem.type === "business") {
            const updated = businesses.map((b) =>
              b.id === selectedItem.id ? { ...b, name: newName } : b
            );
            await AsyncStorage.setItem("businesses", JSON.stringify(updated));
          } else {
            const allBooks: Book[] = JSON.parse(await AsyncStorage.getItem("books") || "[]");
            const updated = allBooks.map((b) =>
              b.id === selectedItem.id ? { ...b, name: newName } : b
            );
            await AsyncStorage.setItem("books", JSON.stringify(updated));
          }

          setEditVisible(false);
          loadData();
        }}
        onClose={() => setEditVisible(false)}
      />

      {/* ----------------------- BACKUP / RESTORE MODAL ----------------------- */}
      {exportModalVisible && (
        <View style={styles.exportOverlay}>
          <View style={[styles.exportCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.exportTitle, { color: theme.textDark }]}>Backup / Restore</Text>

            <TouchableOpacity
              style={[styles.exportButton, { backgroundColor: theme.primary }]}
              onPress={async () => {
                setExportModalVisible(false);
                await exportAllData();
              }}
            >
              <Text style={styles.exportButtonText}>📤 Export All Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportButton, { backgroundColor: theme.success }]}
              onPress={async () => {
                setExportModalVisible(false);
                await importAllData();
              }}
            >
              <Text style={styles.exportButtonText}>📥 Import Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportButton, { backgroundColor: theme.danger }]}
              onPress={() => setExportModalVisible(false)}
            >
              <Text style={styles.exportButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 8,
  },

  gridWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  gridItem: {
    width: "48%",
    padding: 20,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  gridText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  modalContent: {
    padding: 20,
    flex: 1,
  },
  closeBtn: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  exportOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  exportCard: {
    width: "80%",
    padding: 20,
    borderRadius: 14,
  },
  exportTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, textAlign: "center" },
  exportButton: {
    paddingVertical: 12,
    marginVertical: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  exportButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
