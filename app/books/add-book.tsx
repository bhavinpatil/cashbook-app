// app/books/add-book.tsx

import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, Alert, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { GLOBAL_STYLES, COLORS } from '../../constants/theme';
import ScreenContainer from '../../components/ScreenContainer';
import { randomUUID } from 'expo-crypto';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';

interface Business {
  id: string;
  name: string;
}

export default function AddBook() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    const loadBusinesses = async () => {
      const data = await AsyncStorage.getItem('businesses');
      setBusinesses(data ? JSON.parse(data) : []);
    };
    loadBusinesses();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a valid book name.');
      return;
    }
    if (!businessId) {
      Alert.alert('Error', 'Please select a business.');
      return;
    }

    try {
      const id = randomUUID();
      const newBook = { id, name, businessId };

      const data = await AsyncStorage.getItem('books');
      const books = data ? JSON.parse(data) : [];
      books.push(newBook);

      await AsyncStorage.setItem('books', JSON.stringify(books));
      router.back();
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  return (
    <ScreenContainer>
      <Text style={GLOBAL_STYLES.title}>Add New Book</Text>

      <InputField
        placeholder="Book Name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Select Business:</Text>
      <Picker
        selectedValue={businessId}
        style={styles.picker}
        onValueChange={(value) => setBusinessId(value)}
      >
        <Picker.Item label="Select Business" value="" />
        {businesses.map((b) => (
          <Picker.Item key={b.id} label={b.name} value={b.id} />
        ))}
      </Picker>

      <CustomButton title="Save Book" onPress={handleSave} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    color: COLORS.textDark,
    fontSize: 14,
  },
  picker: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: COLORS.card,
  },
});
