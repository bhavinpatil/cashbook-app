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
import { useTheme } from '@/contexts/ThemeContext';
import CustomButton from '@/components/CustomButton';

type TripInput = Omit<Trip, 'id' | 'distance' | 'mileage'> & { images?: string[] };

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: TripInput) => Promise<void> | void;
  initial?: Partial<Trip>;
};

export default function AddTripModal({ visible, onClose, onSave, initial }: Props) {
  const { theme } = useTheme();

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
      setImages((prev) => [...prev, result.assets[0].uri]);
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
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img !== uri));
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
    <Modal visible={visible} animationType="fade" transparent>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.title, { color: theme.textDark }]}>{initial ? 'Edit Trip' : 'Add Trip'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.textLight} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
            <TouchableOpacity style={styles.dateRow} onPress={() => setShowDatePicker(true)}>
              <Text style={[styles.label, { color: theme.textLight }]}>Start Date</Text>
              <Text style={[styles.value, { color: theme.textDark }]}>{startDate.toDateString()}</Text>
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
              <Text style={[styles.label, { color: theme.textLight }]}>End Date (optional)</Text>
              <Text style={[styles.value, { color: theme.textDark }]}>{endDate ? endDate.toDateString() : '—'}</Text>
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

            {/* Fields */}
            <View style={styles.inputRow}>
              <Text style={[styles.label, { color: theme.textLight }]}>Start Odometer (km)</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background, color: theme.textDark }]}
                keyboardType="numeric"
                value={startOdo}
                onChangeText={setStartOdo}
                placeholder="e.g. 10000"
                placeholderTextColor={theme.textLight}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={[styles.label, { color: theme.textLight }]}>End Odometer (km, optional)</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background, color: theme.textDark }]}
                keyboardType="numeric"
                value={endOdo}
                onChangeText={setEndOdo}
                placeholder="e.g. 10250"
                placeholderTextColor={theme.textLight}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={[styles.label, { color: theme.textLight }]}>Fuel Added (L)</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background, color: theme.textDark }]}
                keyboardType="numeric"
                value={fuelAdded}
                onChangeText={setFuelAdded}
                placeholder="e.g. 5.3"
                placeholderTextColor={theme.textLight}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={[styles.label, { color: theme.textLight }]}>Cost (₹)</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background, color: theme.textDark }]}
                keyboardType="numeric"
                value={cost}
                onChangeText={setCost}
                placeholder="e.g. 560"
                placeholderTextColor={theme.textLight}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={[styles.label, { color: theme.textLight }]}>Notes</Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top', borderColor: theme.border, backgroundColor: theme.background, color: theme.textDark }]}
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional trip details..."
                placeholderTextColor={theme.textLight}
              />
            </View>

            {/* Images */}
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.label, { color: theme.textLight }]}>Trip Images (max 4)</Text>
              <View style={styles.imageRow}>
                {images.map((uri) => (
                  <View key={uri} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.imageThumb} />
                    <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(uri)}>
                      <Ionicons name="close-circle" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 4 && (
                  <>
                    <TouchableOpacity style={[styles.addImageBtn, { borderColor: theme.border }]} onPress={handleAddImage}>
                      <Ionicons name="camera" size={20} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.addImageBtn, { borderColor: theme.border }]} onPress={handlePickFromGallery}>
                      <Ionicons name="image" size={20} color={theme.primary} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <CustomButton title="Cancel" type="secondary" onPress={onClose} style={{ flex: 1, marginRight: 8 }} />
            <CustomButton title="Save" onPress={handleSave} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '96%',
    maxHeight: '88%',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    elevation: 12,
  },

  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '600' },
  dateRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 13 },
  value: { fontSize: 14 },
  inputRow: { marginTop: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    fontSize: 16,
  },
  actions: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  imageContainer: { position: 'relative' },
  imageThumb: { width: 70, height: 70, borderRadius: 8 },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 2,
  },
  addImageBtn: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
});
