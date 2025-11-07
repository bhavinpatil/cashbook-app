// app/(tabs)/businesses.tsx
import React, { useCallback, useState } from 'react';
import {
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import { GLOBAL_STYLES, COLORS } from '../../constants/theme';

interface Business {
  id: string;
  name: string;
}

export default function BusinessesScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const router = useRouter();

  const loadBusinesses = async () => {
    try {
      const data = await AsyncStorage.getItem('businesses');
      if (data) setBusinesses(JSON.parse(data));
      else setBusinesses([]);
    } catch (error) {
      console.error('Failed to load businesses:', error);
      setBusinesses([]);
    }
  };

  // reload when screen/tab gains focus
  useFocusEffect(
    useCallback(() => {
      loadBusinesses();
    }, [])
  );

  const renderItem = ({ item }: { item: Business }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        router.push({
          pathname: '/businesses/[businessId]/books',
          params: { businessId: item.id, businessName: item.name },
        })
      }
      activeOpacity={0.8}
    >
      <Text style={styles.itemTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
     <ScreenContainer scrollable={false}>
      <Text style={GLOBAL_STYLES.title}>Businesses</Text>
      <Text style={GLOBAL_STYLES.subtitle}>Select a business</Text>

      <FlatList
        data={businesses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[GLOBAL_STYLES.subtitle, { textAlign: 'center' }]}>
              No businesses found. You can add or manage businesses from Settings.
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
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    // subtle shadow on Android/iOS
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  emptyContainer: {
    marginTop: 24,
  },
});
