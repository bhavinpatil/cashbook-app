//

import CustomButton from '@/components/CustomButton';
import { useTheme } from '@/contexts/ThemeContext';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { randomUUID } from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Transaction } from '@/types/types';

interface Props {
    visible: boolean;
    onClose: () => void;
    onAdd: (tx: Transaction) => void;
    categories?: string[];
    defaultType?: 'credit' | 'debit';
}

export default function AddTransactionModal({
    visible,
    onClose,
    onAdd,
    categories = [],
    defaultType = 'credit',
}: Props) {
    const { theme } = useTheme();
    const [type, setType] = useState<'credit' | 'debit'>('credit');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [category, setCategory] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        if (visible) {
            setType(defaultType);
            setAmount('');
            setDescription('');
            setDate(new Date());
            setCategory('');
            setImages([]);
        }
    }, [visible, defaultType]);

    const pickImage = async () => {
        if (images.length >= 4) {
            Alert.alert('Limit reached', 'You can only add up to 4 images.');
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please grant gallery access to add images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false,
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.length > 0) {
            setImages((prev) => [...prev, result.assets[0].uri]);
        }
    };

    const captureImage = async () => {
        if (images.length >= 4) {
            Alert.alert('Limit reached', 'You can only add up to 4 images.');
            return;
        }

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please grant camera access to take photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.length > 0) {
            setImages((prev) => [...prev, result.assets[0].uri]);
        }
    };

    const removeImage = (uri: string) => {
        setImages((prev) => prev.filter((img) => img !== uri));
    };

    // ✅ ORIGINAL Android date → then time logic restored
    const showDateTimePicker = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: date,
                mode: 'date',
                is24Hour: false,
                onChange: (_: any, selectedDate?: Date) => {
                    if (selectedDate) {
                        // Step 2: select time
                        DateTimePickerAndroid.open({
                            value: selectedDate,
                            mode: 'time',
                            is24Hour: false,
                            onChange: (_: any, selectedTime?: Date) => {
                                if (selectedTime) {
                                    const finalDate = new Date(
                                        selectedDate.getFullYear(),
                                        selectedDate.getMonth(),
                                        selectedDate.getDate(),
                                        selectedTime.getHours(),
                                        selectedTime.getMinutes()
                                    );
                                    setDate(finalDate);
                                }
                            },
                        });
                    }
                },
            });
        } else {
            setShowPicker(true);
        }
    };

    const handleSave = () => {
        if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
            Alert.alert('Invalid amount', 'Please enter a valid amount');
            return;
        }

        const newTx: Transaction = {
            id: randomUUID(),
            bookId: '',
            type,
            amount: Number(amount),
            description,
            date: date.toISOString(),
            category: category.trim() || undefined,
            images,
        };

        onAdd(newTx);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <View
                    style={{
                        backgroundColor: theme.card,
                        width: '92%',
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: theme.border,
                        shadowColor: theme.textDark,
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 4,
                        maxHeight: '90%',
                    }}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: '700',
                                color: theme.textDark,
                                textAlign: 'center',
                                marginBottom: 10,
                            }}
                        >
                            Add Transaction
                        </Text>

                        {/* Credit / Debit Toggle */}
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                            <TouchableOpacity
                                onPress={() => setType('credit')}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    backgroundColor:
                                        type === 'credit' ? theme.success : theme.card,
                                    borderWidth: 1,
                                    borderColor:
                                        type === 'credit' ? theme.success : theme.border,
                                    borderRadius: 8,
                                }}
                            >
                                <Text
                                    style={{
                                        color: type === 'credit' ? '#fff' : theme.textDark,
                                        textAlign: 'center',
                                        fontWeight: '600',
                                    }}
                                >
                                    Credit
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setType('debit')}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    backgroundColor:
                                        type === 'debit' ? theme.danger : theme.card,
                                    borderWidth: 1,
                                    borderColor:
                                        type === 'debit' ? theme.danger : theme.border,
                                    borderRadius: 8,
                                }}
                            >
                                <Text
                                    style={{
                                        color: type === 'debit' ? '#fff' : theme.textDark,
                                        textAlign: 'center',
                                        fontWeight: '600',
                                    }}
                                >
                                    Debit
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Inputs */}
                        <StyledInput
                            placeholder="Amount (₹)"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            theme={theme}
                        />
                        <StyledInput
                            placeholder="Description (optional)"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            theme={theme}
                        />
                        <StyledInput
                            placeholder="Category"
                            value={category}
                            onChangeText={setCategory}
                            theme={theme}
                        />

                        {/* Suggested Categories */}
                        {categories.length > 0 && (
                            <FlatList
                                data={categories.filter((c) =>
                                    c.toLowerCase().includes(category.toLowerCase())
                                )}
                                keyExtractor={(item) => item}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ marginBottom: 10 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => setCategory(item)}
                                        style={{
                                            backgroundColor: theme.primary,
                                            paddingVertical: 6,
                                            paddingHorizontal: 14,
                                            borderRadius: 20,
                                            marginRight: 8,
                                        }}
                                    >
                                        <Text style={{ color: '#fff' }}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}

                        {/* Photos */}
                        <Text style={{ color: theme.textDark, fontWeight: '600', marginBottom: 6 }}>
                            Photos (max 4)
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {images.map((uri, i) => (
                                <View key={i} style={{ position: 'relative' }}>
                                    <Image
                                        source={{ uri }}
                                        style={{
                                            width: 70,
                                            height: 70,
                                            borderRadius: 10,
                                            borderWidth: 1,
                                            borderColor: theme.border,
                                        }}
                                    />
                                    <TouchableOpacity
                                        onPress={() => removeImage(uri)}
                                        style={{
                                            position: 'absolute',
                                            top: -6,
                                            right: -6,
                                            backgroundColor: theme.danger,
                                            borderRadius: 12,
                                            paddingHorizontal: 4,
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontSize: 12 }}>×</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {images.length < 4 && (
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <UploadBox icon="📁" onPress={pickImage} theme={theme} />
                                    <UploadBox icon="📷" onPress={captureImage} theme={theme} />
                                </View>
                            )}
                        </View>

                        {/* Date Picker */}
                        <TouchableOpacity
                            onPress={showDateTimePicker}
                            style={{
                                borderWidth: 1,
                                borderColor: theme.border,
                                borderRadius: 10,
                                padding: 12,
                                marginTop: 16,
                            }}
                        >
                            <Text style={{ color: theme.textDark }}>Select Date & Time:</Text>
                            <Text
                                style={{
                                    color: theme.primary,
                                    fontWeight: '600',
                                    marginTop: 4,
                                }}
                            >
                                {date.toLocaleString()}
                            </Text>
                        </TouchableOpacity>

                        {/* Buttons */}
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 20,
                                gap: 10,
                            }}
                        >
                            <CustomButton
                                title="Cancel"
                                onPress={() => {
                                    setShowPicker(false);
                                    onClose();
                                }}
                                style={{
                                    flex: 1,
                                    backgroundColor: theme.card,
                                    borderWidth: 1,
                                    borderColor: theme.border,
                                }}
                                textColor={theme.textDark} // ✅ ensures visibility on light backgrounds
                            />
                            <CustomButton
                                title="Save"
                                onPress={handleSave}
                                style={{ flex: 1, backgroundColor: theme.primary }}
                            />
                        </View>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

/* ---------- Small Reusable Components ---------- */
const StyledInput = ({
    placeholder,
    value,
    onChangeText,
    multiline,
    keyboardType,
    theme,
}: any) => (
    <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.textLight}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 10,
            padding: 12,
            color: theme.textDark,
            marginBottom: 10,
            height: multiline ? 80 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
        }}
    />
);

const UploadBox = ({ icon, onPress, theme }: any) => (
    <TouchableOpacity
        onPress={onPress}
        style={{
            width: 70,
            height: 70,
            backgroundColor: theme.border,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.border,
        }}
    >
        <Text style={{ fontSize: 18 }}>{icon}</Text>
    </TouchableOpacity>
);
