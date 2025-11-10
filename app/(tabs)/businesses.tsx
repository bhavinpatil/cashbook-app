// app/(tabs)/businesses.tsx
import ScreenContainer from '@/components/ScreenContainer';
import { useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Business {
  id: string;
  name: string;
}

export default function BusinessesScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // ✅ simple first-load flag
  const { theme } = useTheme();

  const loadBusinesses = async () => {
    try {
      const data = await AsyncStorage.getItem('businesses');
      setBusinesses(data ? JSON.parse(data) : []);
    } catch (error) {
      console.error('Failed to load businesses:', error);
      setBusinesses([]);
    } finally {
      setIsLoaded(true); // ✅ only show UI after first load
    }
  };

  useFocusEffect(useCallback(() => { loadBusinesses(); }, []));

  const renderItem = ({ item }: { item: Business }) => (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.name === 'dark' ? '#000' : theme.primary,
        },
      ]}
      activeOpacity={0.85}
    >
      <Text style={[styles.itemTitle, { color: theme.textDark }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  // ✅ Render nothing until AsyncStorage load finishes
  if (!isLoaded) return null;

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: theme.textDark }]}>Your Businesses</Text>

      <FlatList
        data={businesses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 50, color: theme.textLight }}>🏢</Text>
            <Text style={[styles.emptyText, { color: theme.textLight }]}>
              No businesses yet. Add a new one from Settings.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  item: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
});
