// components/trips/AddTripModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '@/hooks/useTrips';

type TripInput = Omit<Trip, 'id' | 'distance' | 'mileage'> & { images?: string[] };

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: TripInput) => Promise<void> | void;
  initial?: Partial<Trip>;
};

export default function AddTripModal({ visible, onClose, onSave, initial }: Props) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const [startOdo, setStartOdo] = useState<string>('');
  const [endOdo, setEndOdo] = useState<string>('');
  const [fuelAdded, setFuelAdded] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (initial) {
      if (initial.startDate) setStartDate(new Date(initial.startDate));
      if (initial.endDate) setEndDate(new Date(initial.endDate));
      if (initial.startOdometer !== undefined) setStartOdo(String(initial.startOdometer));
      if (initial.endOdometer !== undefined) setEndOdo(String(initial.endOdometer));
      if (initial.fuelAdded !== undefined) setFuelAdded(String(initial.fuelAdded));
      if (initial.cost !== undefined) setCost(String(initial.cost));
      if (initial.notes) setNotes(initial.notes);
      if (initial.images) setImages(initial.images);
    } else {
      setStartDate(new Date());
      setEndDate(undefined);
      setStartOdo('');
      setEndOdo('');
      setFuelAdded('');
      setCost('');
      setNotes('');
      setImages([]);
    }
  }, [visible]);

  const handleAddImage = async () => {
    if (images.length >= 4) {
      Alert.alert('Limit Reached', 'You can add up to 4 images only.');
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera permission is needed.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handlePickFromGallery = async () => {
    if (images.length >= 4) {
      Alert.alert('Limit Reached', 'You can add up to 4 images only.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Gallery access is needed.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (uri: string) => {
    setImages(prev => prev.filter(img => img !== uri));
  };

  const handleSave = () => {
    const start = Number(startOdo);
    const end = endOdo ? Number(endOdo) : undefined;
    const fuel = Number(fuelAdded);
    const totalCost = Number(cost);

    if (!start || start < 0) {
      Alert.alert('Validation', 'Please enter a valid start odometer reading.');
      return;
    }
    if (!fuel || fuel <= 0) {
      Alert.alert('Validation', 'Please enter a valid fuel amount (liters).');
      return;
    }
    if (!totalCost || totalCost <= 0) {
      Alert.alert('Validation', 'Please enter a valid trip cost.');
      return;
    }
    if (end && end <= start) {
      Alert.alert('Validation', 'End odometer must be greater than start odometer.');
      return;
    }

    onSave({
      startDate: startDate.toISOString(),
      endDate: endDate ? endDate.toISOString() : undefined,
      startOdometer: start,
      endOdometer: end,
      fuelAdded: fuel,
      cost: totalCost,
      notes,
      images,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.title}>{initial ? 'Edit Trip' : 'Add Trip'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Date Fields */}
            <TouchableOpacity style={styles.dateRow} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.label}>Start Date</Text>
              <Text style={styles.value}>{startDate.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                onChange={(_, selected) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selected) setStartDate(selected);
                }}
              />
            )}

            <TouchableOpacity style={styles.dateRow} onPress={() => setShowEndDatePicker(true)}>
              <Text style={styles.label}>End Date (optional)</Text>
              <Text style={styles.value}>{endDate ? endDate.toDateString() : '—'}</Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                onChange={(_, selected) => {
                  setShowEndDatePicker(Platform.OS === 'ios');
                  if (selected) setEndDate(selected);
                }}
              />
            )}

            {/* Odometer Fields */}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Start Odometer (km)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={startOdo}
                onChangeText={setStartOdo}
                placeholder="e.g. 10000"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>End Odometer (km, optional)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={endOdo}
                onChangeText={setEndOdo}
                placeholder="e.g. 10250"
              />
            </View>

            {/* Fuel & Cost */}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Fuel Added (L)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={fuelAdded}
                onChangeText={setFuelAdded}
                placeholder="e.g. 5.3"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Cost (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={cost}
                onChangeText={setCost}
                placeholder="e.g. 560"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional trip details..."
              />
            </View>

            {/* 📸 Images */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.label}>Trip Images (max 4)</Text>
              <View style={styles.imageRow}>
                {images.map((uri) => (
                  <View key={uri} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.imageThumb} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => removeImage(uri)}
                    >
                      <Ionicons name="close-circle" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 4 && (
                  <>
                    <TouchableOpacity style={styles.addImageBtn} onPress={handleAddImage}>
                      <Ionicons name="camera" size={24} color="#2f95dc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addImageBtn} onPress={handlePickFromGallery}>
                      <Ionicons name="image" size={24} color="#2f95dc" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={{ color: '#333' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={{ color: '#fff' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    maxHeight: '90%',
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '600' },
  dateRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14 },
  inputRow: { marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  actions: { marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 10, marginRight: 8 },
  saveBtn: { padding: 10, backgroundColor: '#2f95dc', borderRadius: 8 },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  imageContainer: { position: 'relative' },
  imageThumb: { width: 70, height: 70, borderRadius: 8 },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
  },
  addImageBtn: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
