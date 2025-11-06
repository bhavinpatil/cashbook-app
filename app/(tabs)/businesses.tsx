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

interface Business {
  id: string;
  name: string;
}

export default function BusinessesScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
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

  const renderItem = ({ item }: { item: Business }) => (
    <TouchableOpacity
      style={styles.item}
      // onPress={() => router.push(`/books?businessId=${item.id}`)}
      onPress={() => router.push(`/businesses/${item.id}/books`)}
    >
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
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
});
