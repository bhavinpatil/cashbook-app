import React, { useCallback, useState } from 'react';
import { Text, FlatList, TouchableOpacity, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import { useTheme } from '../../contexts/ThemeContext';

interface Business {
  id: string;
  name: string;
}

export default function BusinessesScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const { theme } = useTheme();

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

  useFocusEffect(useCallback(() => { loadBusinesses(); }, []));

  const renderItem = ({ item }: { item: Business }) => (
    <TouchableOpacity style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]} activeOpacity={0.9}>
      <Text style={[styles.itemTitle, { color: theme.textDark }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: theme.textDark }]}>Businesses</Text>
      <Text style={[styles.subtitle, { color: theme.textLight }]}>Select a business</Text>

      <FlatList
        data={businesses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.subtitle, { color: theme.textLight, textAlign: 'center' }]}>
              No businesses found. You can add or manage businesses from Settings.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  item: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});
