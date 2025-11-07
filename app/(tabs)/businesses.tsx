// app/(tabs)/businesses.tsx

import React, { useCallback, useState } from 'react';
import { Text, FlatList, TouchableOpacity, StyleSheet, View, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '@/components/ScreenContainer';
import { useTheme } from '@/contexts/ThemeContext';
import AnimatedScreenWrapper from '@/components/AnimatedScreenWrapper';

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
      setBusinesses(data ? JSON.parse(data) : []);
    } catch (error) {
      console.error('Failed to load businesses:', error);
      setBusinesses([]);
    }
  };

  useFocusEffect(useCallback(() => { loadBusinesses(); }, []));

  const renderItem = ({ item, index }: { item: Business; index: number }) => {
    const scale = new Animated.Value(0.9);
    const opacity = new Animated.Value(0);

    Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    return (
      <Animated.View style={{ transform: [{ scale }], opacity }}>
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
      </Animated.View>
    );
  };

  return (
    <ScreenContainer>
      <AnimatedScreenWrapper>
        <Text style={[styles.title, { color: theme.textDark }]}>Your Businesses</Text>

        <FlatList
          data={businesses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 80 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {/* Temporary fallback until Lottie file is added */}
              <Text style={{ fontSize: 50, color: theme.textLight }}>📚</Text>
              <Text style={[styles.emptyText, { color: theme.textLight }]}>
                No books yet. Add a new one from Settings.
              </Text>
            </View>
          }
        />
      </AnimatedScreenWrapper>
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
