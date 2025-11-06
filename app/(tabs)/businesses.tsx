// app/(tabs)/businesses.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; // ✅ added
import ScreenContainer from '../../components/ScreenContainer';
import { GLOBAL_STYLES, COLORS } from '../../constants/theme';
import CustomButton from '@/components/CustomButton';
import EditNameModal from '../../components/EditNameModal';
import { Alert, View } from 'react-native';

interface Business {
  id: string;
  name: string;
}

export default function BusinessesScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const router = useRouter();

  // Load businesses from local storage
  const loadBusinesses = async () => {
    try {
      const data = await AsyncStorage.getItem('businesses');
      if (data) setBusinesses(JSON.parse(data));
      else setBusinesses([]);
    } catch (error) {
      console.error('Failed to load businesses:', error);
    }
  };

  // ✅ useFocusEffect ensures data reload on tab focus
  useFocusEffect(
    useCallback(() => {
      loadBusinesses();
    }, [])
  );

  const deleteBusiness = async (id: string) => {
    Alert.alert('Confirm Delete', 'Delete this business and all its books?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const businessesData = await AsyncStorage.getItem('businesses');
          const booksData = await AsyncStorage.getItem('books');
          const businesses = businessesData ? JSON.parse(businessesData) : [];
          const books = booksData ? JSON.parse(booksData) : [];

          const updatedBusinesses = businesses.filter((b: Business) => b.id !== id);
          const updatedBooks = books.filter((b: any) => b.businessId !== id);

          await AsyncStorage.setItem('businesses', JSON.stringify(updatedBusinesses));
          await AsyncStorage.setItem('books', JSON.stringify(updatedBooks));
          loadBusinesses();
        },
      },
    ]);
  };

  const handleEditSave = async (newName: string) => {
    if (!selectedBusiness || !newName) return;
    const updated = businesses.map((b) =>
      b.id === selectedBusiness.id ? { ...b, name: newName } : b
    );
    await AsyncStorage.setItem('businesses', JSON.stringify(updated));
    setBusinesses(updated);
  };

  const renderItem = ({ item }: { item: Business }) => (
    <View style={styles.item}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => router.push({
          pathname: '/businesses/[businessId]/books',
          params: { businessId: item.id, businessName: item.name },
        })}
      >
        <Text style={styles.itemText}>{item.name}</Text>
      </TouchableOpacity>

      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => { setSelectedBusiness(item); setEditVisible(true); }}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteBusiness(item.id)}>
          <Text style={[styles.actionText, { color: COLORS.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <ScreenContainer>
      <Text style={GLOBAL_STYLES.title}>Businesses</Text>
      <Text style={GLOBAL_STYLES.subtitle}>
        Select a business or add a new one
      </Text>

      <FlatList
        data={businesses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, marginBottom: 20 }}
      />

      <CustomButton title="＋ Add New Business" onPress={() => router.push("/businesses/add-business")} />

      <EditNameModal
        visible={editVisible}
        initialValue={selectedBusiness?.name || ''}
        title="Edit Business Name"
        onSave={handleEditSave}
        onClose={() => setEditVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,            // space between title and buttons
  },

  actionsContainer: {
    flexDirection: 'row',       // places Edit & Delete side by side
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  actionText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 15,
    marginRight: 12,            // space between Edit & Delete
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
  },
});
