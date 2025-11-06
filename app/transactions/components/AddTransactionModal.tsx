// app/transactions/components/AddTransactionModal.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Button, Platform, FlatList, Image, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, GLOBAL_STYLES } from '../../../constants/theme';
import { Transaction } from '../types';
import { randomUUID } from 'expo-crypto';
import { Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface Props {
    visible: boolean;
    onClose: () => void;
    onAdd: (tx: Transaction) => void;
    categories?: string[];
}

export default function AddTransactionModal({ visible, onClose, onAdd, categories = [], }: Props) {
    const [type, setType] = useState<'credit' | 'debit'>('credit');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [category, setCategory] = useState('');
    const [images, setImages] = useState<string[]>([]);

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            setType('credit');
            setAmount('');
            setDescription('');
            setDate(new Date());
            setCategory('');
            setImages([]);
        }
    }, [visible]);

    // 🧠 Pick Image from Gallery
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

    // 📸 Capture photo using camera
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

    const handleSave = () => {
        if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        // hide picker if open to avoid dismiss errors on Android
        // setShowPicker(false);

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

        // Small delay ensures picker fully unmounts before modal closes
        // setTimeout(() => {
        //     onClose();
        //     setAmount('');
        //     setDescription('');
        //     setDate(new Date());
        // }, 200);
    };


    const onChangeDate = (_: any, selectedDate?: Date) => {
        if (selectedDate) setDate(selectedDate);
        if (Platform.OS !== 'ios') setShowPicker(false);
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <View
                    style={{
                        backgroundColor: 'white',
                        width: '90%',
                        borderRadius: 12,
                        padding: 20,
                    }}
                >
                    <Text style={GLOBAL_STYLES.title}>Add Transaction</Text>

                    {/* Credit / Debit toggle */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: type === 'credit' ? COLORS.success : 'transparent',
                                padding: 10,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: COLORS.border,
                                marginHorizontal: 5,
                            }}
                            onPress={() => setType('credit')}
                        >
                            <Text style={{ color: type === 'credit' ? 'white' : COLORS.textDark }}>Credit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                backgroundColor: type === 'debit' ? COLORS.danger : 'transparent',
                                padding: 10,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: COLORS.border,
                                marginHorizontal: 5,
                            }}
                            onPress={() => setType('debit')}
                        >
                            <Text style={{ color: type === 'debit' ? 'white' : COLORS.textDark }}>Debit</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: COLORS.border,
                            borderRadius: 8,
                            padding: 10,
                            marginVertical: 8,
                        }}
                        placeholder="Amount (₹)"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />

                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: COLORS.border,
                            borderRadius: 8,
                            padding: 10,
                            marginVertical: 8,
                            height: 80,
                        }}
                        placeholder="Description (optional)"
                        multiline
                        value={description}
                        onChangeText={setDescription}
                    />
                    <Text style={{ marginTop: 8, fontWeight: '600' }}>Category</Text>

                    <TextInput
                        placeholder="Enter category or select existing"
                        value={category}
                        onChangeText={setCategory}
                        style={{
                            borderWidth: 1,
                            borderColor: COLORS.border,
                            borderRadius: 8,
                            padding: 10,
                            marginVertical: 8,
                        }}
                    />

                    {categories.length > 0 && (
                        <FlatList
                            data={categories.filter((c) => c.toLowerCase().includes(category.toLowerCase()))}
                            keyExtractor={(item) => item}
                            horizontal
                            style={{ marginVertical: 8 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => setCategory(item)}
                                    style={{
                                        backgroundColor: COLORS.primary,
                                        paddingVertical: 6,
                                        paddingHorizontal: 12,
                                        borderRadius: 20,
                                        marginRight: 8,
                                    }}
                                >
                                    <Text style={{ color: 'white' }}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    {/* 📷 Image Section */}
                    <Text style={{ marginTop: 10, fontWeight: '600' }}>Photos (max 4)</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10 }}>
                        {images.map((uri, index) => (
                            <View key={index} style={{ position: 'relative', marginRight: 10, marginBottom: 10 }}>
                                <Image
                                    source={{ uri }}
                                    style={{ width: 70, height: 70, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border }}
                                />
                                <TouchableOpacity
                                    onPress={() => removeImage(uri)}
                                    style={{
                                        position: 'absolute',
                                        top: -8,
                                        right: -8,
                                        backgroundColor: COLORS.danger,
                                        borderRadius: 12,
                                        paddingHorizontal: 4,
                                    }}
                                >
                                    <Text style={{ color: 'white', fontSize: 12 }}>×</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        {images.length < 4 && (
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity
                                    onPress={pickImage}
                                    style={{
                                        width: 70,
                                        height: 70,
                                        backgroundColor: COLORS.border,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 8,
                                    }}
                                >
                                    <Text>📁</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={captureImage}
                                    style={{
                                        width: 70,
                                        height: 70,
                                        backgroundColor: COLORS.border,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 8,
                                    }}
                                >
                                    <Text>📷</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>


                    {/* Date and Time Picker */}
                    <TouchableOpacity
                        onPress={() => setShowPicker(true)}
                        style={{
                            padding: 10,
                            borderWidth: 1,
                            borderColor: COLORS.border,
                            borderRadius: 8,
                            marginVertical: 8,
                        }}
                    >
                        <Text>Select Date & Time:</Text>
                        <Text style={{ color: COLORS.textDark, fontWeight: '500', marginTop: 4 }}>
                            {date.toLocaleString()}
                        </Text>
                    </TouchableOpacity>

                    {showPicker && visible && (
                        <DateTimePicker
                            value={date}
                            mode="datetime"
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                        <Button title="Cancel" onPress={() => { setShowPicker(false); onClose(); }} />
                        <Button title="Save" onPress={handleSave} color={COLORS.primary} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}
